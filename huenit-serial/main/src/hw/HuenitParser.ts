import { arrayConcat, arrayIndexOf, chr } from '@/util/misc'
import { Observable } from 'rxjs'

// packet delimiter
const DELIMITER = [chr('\n')] // new line character

interface Options {
  includeDelimiter: boolean
  delimiter: Uint8Array
}

type TransformFn = (upstream: Observable<Uint8Array>) => Observable<Uint8Array>

type PacketHandlerFn = (packet: Uint8Array) => void

/**
 * This class is delimiter parser.
 * This class can be used on different hardware by simply changing the delimiter.
 */
export class HuenitParser {
  /**
   * Intermediate buffer
   */
  private buffer: Uint8Array

  /**
   * Whether including delimiters
   */
  private readonly includeDelimiter: boolean

  /**
   * delimiter
   */
  private readonly delimiter: Uint8Array

  /**
   * packet callback
   * This is called when the packet is created.
   */
  private readonly packetCallback_: PacketHandlerFn

  /**
   * constructor
   */
  constructor(options: Options, packetCallback: PacketHandlerFn) {
    this.buffer = new Uint8Array(0)
    this.delimiter = options.delimiter
    this.includeDelimiter = options.includeDelimiter
    this.packetCallback_ = packetCallback
  }

  /**
   * This is called when data is received from the hardware.
   */
  enqueue = (chunk: Uint8Array) => {
    let data = arrayConcat(this.buffer, chunk)
    let position = -1
    // eslint-disable-next-line no-constant-condition
    while (true) {
      position = arrayIndexOf(data, this.delimiter)
      if (position === -1) {
        break
      }

      if (this.includeDelimiter) {
        this.packetCallback_(data.slice(0, position + this.delimiter.length))
      } else {
        this.packetCallback_(data.slice(0, position))
      }
      data = data.slice(position + this.delimiter.length)
    }
    this.buffer = data
  }

  /**
   * rxjs operator function
   * upstream = raw byte array
   * downstream = packet
   */
  static parse = (): TransformFn => {
    return (upstream: Observable<Uint8Array>) => {
      return new Observable((subscriber) => {
        const handleParsedResult = (packet: Uint8Array) => {
          if (!subscriber.closed && packet.byteLength > 0) {
            subscriber.next(packet)
          }
        }

        const parser = new HuenitParser(
          {
            includeDelimiter: false,
            delimiter: new Uint8Array(DELIMITER),
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
