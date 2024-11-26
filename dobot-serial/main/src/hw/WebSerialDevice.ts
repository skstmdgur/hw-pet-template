import { sleepAsync } from '@repo/ui'
import type { Observable } from 'rxjs'
import {
  BehaviorSubject,
  EMPTY,
  Subject,
  distinctUntilChanged,
  filter,
  firstValueFrom,
  map,
  switchMap,
  take,
  timeout,
} from 'rxjs'
import type { BufferTimestamped } from './types'

type HwDeviceState = 'opening' | 'opened' | 'closing' | 'closed'

export class WebSerialDevice {
  DEBUG = false

  private deviceState$ = new BehaviorSubject<HwDeviceState>('closed')

  private deviceRawData$ = new Subject<BufferTimestamped>()

  private port_?: SerialPort

  private reader_?: ReadableStreamDefaultReader

  private writer_?: WritableStreamDefaultWriter

  private readLoopPromise_?: Promise<void>

  getRawSerialPort = (): SerialPort | undefined => {
    return this.port_
  }

  /**
   * 디바이스의 상태 관찰
   */
  observeDeviceState = (): Observable<HwDeviceState> => this.deviceState$.asObservable()

  /**
   * 디바이스의 연결 여부 관찰
   */
  observeOpenedOrNot = (): Observable<boolean> =>
    this.deviceState$.pipe(map((it) => it === 'opened'))

  /**
   * 연결이 될 때까지 기다리기
   */
  waitUntilOpened = (timeoutMilli = 0): Promise<boolean> => {
    if (timeoutMilli > 0) {
      return firstValueFrom(
        this.deviceState$.pipe(
          filter((it) => it === 'opened'),
          take(1),
          timeout({ first: timeoutMilli }),
          map(() => true),
        ),
      )
    } else {
      return firstValueFrom(
        this.deviceState$.pipe(
          filter((it) => it === 'opened'),
          take(1),
          map(() => true),
        ),
      )
    }
  }

  /**
   * 디바이스의 데이터 관찰
   */
  observeRawData = (): Observable<BufferTimestamped> => {
    return this.deviceState$.pipe(
      distinctUntilChanged(),
      map((state) => state === 'opened'),
      switchMap((isOpened) => {
        return isOpened ? this.deviceRawData$.asObservable() : EMPTY
      }),
    )
  }

  /**
   * 연결 여부
   */
  isOpened = (): boolean => {
    return this.deviceState$.value === 'opened'
  }

  private closeAndWait_ = async () => {
    if (this.deviceState$.value === 'closed') return
    if (this.deviceState$.value !== 'closing') {
      if (this.DEBUG) console.log('WebSerialDevice.closeAndWait_()')
      this.close()
    }
    await firstValueFrom(this.deviceState$.pipe(filter((it) => it === 'closed')))
  }

  /**
   * 디바이스 열기
   */
  open = async (port: SerialPort, options: SerialOptions): Promise<void> => {
    if (this.DEBUG) console.log('WebSerialDevice.open()', options)
    await this.closeAndWait_()
    if (this.DEBUG) console.log('WebSerialDevice.open() opening')
    this.deviceState$.next('opening')

    while (this.deviceState$.value !== 'closed' && this.deviceState$.value !== 'closing') {
      if (!port.readable) {
        try {
          if (this.DEBUG) console.log('WebSerialDevice.open() : port.open() called')
          await port.open(options)
        } catch (err) {
          console.log(err)
        }
      }

      if (port.readable) {
        break
      }

      if (!port.readable) {
        console.warn('WebSerialDevice.open() : port.open() failed, port is not readable, retry')
        // this.deviceState$.next('closed')
        await sleepAsync(200)
        continue
      }
    }

    if (this.deviceState$.value === 'opening' && port.readable) {
      this.onOpened_(port)
    }
  }

  private onOpened_ = (port: SerialPort) => {
    if (this.DEBUG) console.debug('WebSerialDevice.onOpened_()')
    this.port_ = port
    this.deviceState$.next('opened')
    this.readLoopPromise_ = this.startReadLoop_()
  }

  /**
   * 시리얼포트 읽기 루프 실행
   */
  private startReadLoop_ = async () => {
    while (this.deviceState$.value === 'opened') {
      if (this.DEBUG) {
        if (!this.port_) {
          console.warn('WebSerialDevice.startReadLoop_() this.port_ is null')
        } else if (!this.port_.readable) {
          console.warn('WebSerialDevice.startReadLoop_() this.port_.readable is null')
        }
      }

      if (!this.port_ || !this.port_.readable) {
        await sleepAsync(100)
        continue
      }

      if (this.DEBUG) console.log('WebSerialDevice.startReadLoop_() locked reader')
      // 이미 시리얼포트에 락이 걸려있는 경우는 실패한다
      const reader = this.getReaderOrNull_(this.port_)
      if (!reader) {
        await sleepAsync(100)
        continue
      }
      this.reader_ = reader
      try {
        await this.doReadFromReader_(reader)
        console.log('doReadFromReader_() end! deviceState =' + this.deviceState$.value)
      } catch (err) {
        // Handle non-fatal
        console.info('startReadLoop_(): ignore error', err)
      } finally {
        if (this.DEBUG) console.log('WebSerialDevice.startReadLoop_() reader.releaseLock()')

        this.reader_?.releaseLock()
        this.reader_ = undefined
      }
    }
  }

  private getReaderOrNull_(port: SerialPort): ReadableStreamDefaultReader<Uint8Array> | null {
    const readable = port.readable
    if (!readable) return null
    try {
      const reader = readable.getReader()
      return reader
    } catch (err) {
      // 시리얼포트에 락이 걸려있음
    }
    return null
  }

  private doReadFromReader_ = async (reader: ReadableStreamDefaultReader<Uint8Array>) => {
    // console.log(`XXX WebSerialDevice.doReadFromReader_(): ${this.deviceState$.value}`)
    while (this.deviceState$.value === 'opened') {
      const { value: dataBuffer, done } = await reader.read()
      // console.log(`XXX WebSerialDevice. reader.read(): ${done ? 'done' : ''}, ${dataBuffer?.byteLength ?? -1} bytes`)
      if (done) {
        break
      }

      if (dataBuffer) {
        this.deviceRawData$.next({ timestamp: Date.now(), dataBuffer })
      }
    }
  }

  /**
   * 시리얼포트에 데이터 전송
   * @param value data to send
   * @returns Promise<void>
   */
  write = async (value: Uint8Array): Promise<void> => {
    const port = this.port_
    if (!port) {
      console.warn('WebSerialDevice.write() : port is not bound')
      return
    }

    if (!port.writable) {
      console.warn('WebSerialDevice.write() : port is not writable')
      return
    }

    if (port.writable.locked) {
      console.warn('WebSerialDevice.write() : port is locked')
      await sleepAsync(100)
      return
    }
    const writer = port.writable.getWriter()
    try {
      this.writer_ = writer
      await writer.write(value)
    } finally {
      writer.releaseLock()
      this.writer_ = undefined
    }
  }

  /**
   * 디바이스 닫기
   */
  close = async () => {
    if (this.DEBUG) console.log('WebSerialDevice.close() currentState=' + this.deviceState$.value)
    if (this.deviceState$.value === 'closed') {
      // console.log('ignore close, already closed')
      return
    }

    if (this.deviceState$.value === 'closing') {
      console.log('ignore close, already closing')
      return
    }

    this.deviceState$.next('closing')
    try {
      if (this.reader_) {
        await this.reader_.cancel()
        this.reader_ = undefined
      }

      if (this.readLoopPromise_) {
        await this.readLoopPromise_.catch(() => {
          /* ignore error */
        })
        this.readLoopPromise_ = undefined
      }

      if (this.writer_) {
        if (!this.writer_.closed) {
          await this.writer_.close()
        }
        this.writer_ = undefined
      }

      if (this.port_) {
        await this.port_.close().catch(() => {
          /* ignore error */
        })
        this.port_ = undefined
      }
    } finally {
      if (this.DEBUG) console.log('WebSerialDevice closed')
      this.deviceState$.next('closed')
    }
  }
}
