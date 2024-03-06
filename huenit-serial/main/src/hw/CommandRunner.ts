import { sleepAsync } from '@repo/ui'
import { CommandRunnerBase } from './CommandRunnerBase'

/**
 * Inherits from the CommandRunnerBase class.
 * CommandRunnerBase handles the aspects related to the connection with hardware,
 * and this class handles the remaining commands that are sent to the hardware.
 */

export class CommandRunner extends CommandRunnerBase {
  private chr(ch: string): number {
    return ch.charCodeAt(0)
  }

  private numToChrArray(num: number): number[] {
    return num
      .toString()
      .split('')
      .map((digit) => this.chr(digit))
  }

  private strToAsciiArray(str: string): number[] {
    return Array.from(str).map((char) => char.charCodeAt(0))
  }

  async eye(): Promise<void> {
    const pkt = [
      this.chr('G'),
      this.chr('0'),
      this.chr('X'),
      this.chr('0'),
      this.chr('Y'),
      this.chr('2'),
      this.chr('0'),
      this.chr('0'),
      this.chr('Z'),
      this.chr('0'),
      this.chr('\n'),
      this.chr('G'),
      this.chr('0'),
      this.chr('X'),
      this.chr('0'),
      this.chr('Y'),
      this.chr('2'),
      this.chr('5'),
      this.chr('0'),
      this.chr('Z'),
      this.chr('0'),
      this.chr('\n'),
    ]

    // await this.sendCommand(new Uint8Array(pkt))
    await this.writeRaw_(pkt)
  }

  // async robotHome(): Promise<void> {
  //   const pkt = this.strToAsciiArray('M1008A5\n')
  //   await this.sendCommand(new Uint8Array(pkt))
  // }
  async robotHome(): Promise<void> {
    await this.writeRaw_('M1008A5\n')
  }

  // async moveG0(x: number, y: number, z: number): Promise<void> {
  //   const pkt = [
  //     this.chr('G'),
  //     this.chr('0'),
  //     this.chr('X'),
  //     ...this.numToChrArray(x),
  //     this.chr('Y'),
  //     ...this.numToChrArray(y),
  //     this.chr('Z'),
  //     ...this.numToChrArray(z),
  //     this.chr('\n'),
  //   ]
  //   await this.sendCommand(new Uint8Array(pkt))
  // }

  async moveG0(x: number, y: number, z: number): Promise<void> {
    await this.writeRaw_(`G0X${x}Y${y}Z${z}\n`)
  }

  // async suctionOn(): Promise<void> {
  //   const pkt = this.strToAsciiArray('M1401A0\nM1400A1023\n')
  //   await this.sendCommand(new Uint8Array(pkt))
  // }

  async suctionOn(): Promise<void> {
    await this.writeRaw_('M1401A0\nM1400A1023\n')
  }

  // async suctionOff(): Promise<void> {
  //   const pkt1 = this.strToAsciiArray('M1400A0\nM1401A1\n')
  //   await this.sendCommand(new Uint8Array(pkt1))
  //   // Wait for 300 milliseconds
  //   await new Promise((resolve) => {
  //     setTimeout(resolve, 300)
  //   })
  //   const pkt2 = this.strToAsciiArray('M1401A0\n')
  //   await this.sendCommand(new Uint8Array(pkt2))
  // }

  async suctionOff(): Promise<void> {
    await this.writeRaw_('M1400A0\nM1401A1\n')
    await sleepAsync(300)
    await this.writeRaw_('M1401A0\n')
  }

  async timeSleep(t: number): Promise<void> {
    await new Promise((resolve) => {
      setTimeout(resolve, t * 1000)
    })
  }

  // async sendCommand(data: Uint8Array): Promise<void> {
  //   if (this.port && this.port.writable) {
  //     const writer = this.port.writable.getWriter()
  //     await writer.write(data)
  //     writer.releaseLock()
  //     console.log('Data sent to serial port', data)
  //   } else {
  //     console.error('Serial port not connected or not writable')
  //   }
  // }

  // sendTestData = async (): Promise<string> => {
  //   try {
  //     if (this.port && this.port.writable) {
  //       const writer = this.port.writable.getWriter()
  //       const encoder = new TextEncoder()
  //       const data = encoder.encode('M1008A5')
  //       await writer.write(data)
  //       writer.releaseLock()
  //       console.log('Serial data sent')
  //       return 'success'
  //     }
  //     console.error('Serial port not connected or not writable')
  //     return 'not connect'
  //   } catch (error) {
  //     console.error('Error sending test data:', error)
  //     return 'sending error'
  //   }
  // }

  sendTestData = async (): Promise<string> => {
    try {
      await this.writeRaw_('M1008A5')
      return 'success'
    } catch (err) {
      console.error('Error sending test data:', err)
      return 'sending error'
    }
  }

  /**
   * command: foo
   *
   * The return value is automatically sent to the parent frame (CODINY)
   * @returns 'bar'
   */
  foo = async (): Promise<string> => {
    return 'bar'
  }

  /**
   * command: echo
   *
   * The return value is automatically sent to the parent frame (CODINY)
   * @param what - string to echo
   * @returns echo string
   */
  echo = async (what: string): Promise<string> => {
    return what
  }

  cameraSnapshot = async (imageUrl: string): Promise<void> => {
    alert(`imageUrl:\n${imageUrl}`)
  }
}
