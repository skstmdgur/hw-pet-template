import { sliceToUint8Array } from '@/util/misc'
import { Observable } from 'rxjs'

const LOG_TAG = 'SaeonSmartFarmParser'

type TransformFn = (upstream: Observable<Uint8Array>) => Observable<Uint8Array>
type PacketHandlerFn = (packet: Uint8Array) => void

interface Options {
  startMark: number
  endMark: number
  packetLength: number
}

/**
 * SaeonSmartFarmParser입니다
 * 지정된 패킷 크기의 시작/종료 마크를 찾아서 패킷을 전송합니다.
 * Transform 클래스를 상속합니다
 */
export class SaeonSmartFarmParser {
  // 중개 버퍼
  private buffer: Array<number>

  // 중개 버퍼에 채워진 바이트수
  private bufferByteCount = 0

  // 시작 마크
  private readonly startMark // ex) 0x02

  // 종료 마크
  private readonly endMark // ex) 0x03

  // 22바이트를 채워서 보냅니다
  private readonly packetLength // ex) 22

  private packetCallback_: PacketHandlerFn

  constructor(options: Options, packetCallback: PacketHandlerFn) {
    this.buffer = new Array<number>(this.packetLength).fill(0)
    this.bufferByteCount = 0
    this.startMark = options.startMark
    this.endMark = options.endMark
    this.packetLength = options.packetLength
    this.packetCallback_ = packetCallback
    console.log(LOG_TAG, 'SaeonSmartFarmParser.constructor()')
  }

  enqueue = (chunk: Uint8Array) => {
    for (let i = 0; i < chunk.byteLength; i++) {
      if (this.bufferByteCount === 0) {
        const byte = chunk[i]
        if (byte === this.startMark) {
          this.buffer[0] = byte
          this.bufferByteCount = 1
        }
        // skip
        continue
      }

      const byte = chunk[i]
      this.buffer[this.bufferByteCount++] = byte

      if (this.bufferByteCount === this.packetLength) {
        if (byte === this.endMark) {
          this.packetCallback_(sliceToUint8Array(this.buffer, 0, this.packetLength))
          this.bufferByteCount = 0
        } else {
          console.log(LOG_TAG, 'end-mark mismatch')
          const idx = this.buffer.indexOf(this.startMark, 1)
          if (idx > 0) {
            this.buffer.copyWithin(0, idx, this.packetLength)
            this.bufferByteCount = this.packetLength - idx
          } else {
            this.bufferByteCount = 0
          }
        }
      }
    }
  }

  static parse = (): TransformFn => {
    return (upstream: Observable<Uint8Array>) => {
      return new Observable((subscriber) => {
        const handleParsedResult = (packet: Uint8Array) => {
          if (!subscriber.closed && packet.byteLength > 0) {
            subscriber.next(packet)
          }
        }
        const parser = new SaeonSmartFarmParser(
          {
            startMark: 0x02, // 시작 마크
            endMark: 0x03, // 종료 마크
            packetLength: 22, // 22바이트를 채워서 보냅니다
          },
          handleParsedResult,
        )
        const subscription = upstream.subscribe({
          next: parser.enqueue,
          error: subscriber.error,
          complete: subscriber.complete,
        })

        return () => {
          subscription.unsubscribe()
        }
      })
    }
  }
}
