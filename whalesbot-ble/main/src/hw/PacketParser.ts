import { sliceToUint8Array } from '@/util/misc';
import { Observable } from 'rxjs';

const LOG_TAG = 'PacketParser';

type TransformFn = (upstream: Observable<Uint8Array>) => Observable<Uint8Array>;
type PacketHandlerFn = (packet: Uint8Array) => void;

interface Options {
  startMark: number;
  start2Mark: number;
  packetLength: number;
}

/**
 * PacketParser
 * 查找指定数据包大小的开始/结束标记并发送数据包。
 * Transform 클래스를 상속합니다
 */
export class PacketParser {
  // 중개 버퍼
  private buffer: Array<number>;

  // 중개 버퍼에 채워진 바이트수
  private bufferByteCount = 0;

  private readonly startMark; // 0x77
  private readonly start2Mark; // 0x68

  private readonly packetLength; // ex) 20

  private packetCallback_: PacketHandlerFn;

  constructor(options: Options, packetCallback: PacketHandlerFn) {
    this.buffer = new Array<number>(this.packetLength).fill(0);
    this.bufferByteCount = 0;
    this.startMark = options.startMark;
    this.start2Mark = options.start2Mark;
    this.packetLength = options.packetLength;
    this.packetCallback_ = packetCallback;
  }

  private findHead(): number {
    let idx = this.buffer.indexOf(this.startMark, 1);
    while (idx >= 0) {
      if (idx == this.buffer.length - 1) {
        return idx;
      }
      if (this.buffer[idx + 1] === this.start2Mark) {
        return idx;
      }
      idx = this.buffer.indexOf(this.startMark, idx + 1);
    }

    return -1;
  }

  enqueue = (chunk: Uint8Array) => {
    for (let i = 0; i < chunk.byteLength; i++) {
      const byte = chunk[i];
      this.buffer[this.bufferByteCount++] = byte;

      if (this.bufferByteCount >= this.packetLength) {
        if (this.buffer[0] === this.startMark && this.buffer[1] === this.start2Mark) {
          this.packetCallback_(sliceToUint8Array(this.buffer, 0, this.packetLength));
          this.bufferByteCount = 0;
        } else {
          console.log(LOG_TAG, 'end-mark mismatch');
          const idx = this.findHead();
          if (idx > 0) {
            this.buffer.copyWithin(0, idx, this.packetLength);
            this.bufferByteCount = this.packetLength - idx;
          } else {
            this.bufferByteCount = 0;
          }
        }
      }
    }
  };

  static parse = (): TransformFn => {
    return (upstream: Observable<Uint8Array>) => {
      return new Observable((subscriber) => {
        const handleParsedResult = (packet: Uint8Array) => {
          if (!subscriber.closed && packet.byteLength > 0) {
            subscriber.next(packet);
          }
        };
        const parser = new PacketParser(
          {
            startMark: 0x77, // 시작 마크
            start2Mark: 0x68,
            packetLength: 20, // 22바이트를 채워서 보냅니다
          },
          handleParsedResult,
        );
        const subscription = upstream.subscribe({
          next: parser.enqueue,
          error: subscriber.error,
          complete: subscriber.complete,
        });

        return () => {
          subscription.unsubscribe();
        };
      });
    };
  };
}
