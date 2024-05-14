import { CommandRunnerBase } from './CommandRunnerBase'

/**
 * Inherits from the CommandRunnerBase class.
 * CommandRunnerBase handles the aspects related to the connection with hardware,
 * and this class handles the remaining commands that are sent to the hardware.
 */
export class CommandRunner extends CommandRunnerBase {
  async eye(): Promise<void> {
    await this.write_('eye1', 'G0X0Y200Z0\n')
    await this.write_('eye2', 'G0X0Y250Z0\n')
  }

  async robotHome(): Promise<void> {
    await this.write_('robotHome', 'M1008A5\n')
  }

  async moveG0(x: number, y: number, z: number): Promise<void> {
    await this.write_('moveG0', `G0X${x}Y${y}Z${z}\n`)
  }

  async suctionOn(): Promise<void> {
    await this.write_('suctionOn1', 'M1401A0\n')
    await this.write_('suctionOn2', 'M1400A1023\n')
  }

  async suctionOff(): Promise<void> {
    await this.write_('suctionOff1', 'M1400A0\n', 300)
    await this.write_('suctionOff2', 'M1401A1\n', 300)
    await this.write_('suctionOff3', 'M1401A0\n', 300)
  }

  async timeSleep(t: number): Promise<void> {
    await new Promise((resolve) => {
      setTimeout(resolve, t * 1000)
    })
  }

  sendTestData = async (): Promise<string> => {
    try {
      await this.write_('sendTestData', 'M1008A5')
      return 'success'
    } catch (err) {
      console.error('Error sending test data:', err)
      return 'sending error'
    }
  }

  cameraSnapshot = async (imageUrl: string): Promise<void> => {
    alert(`imageUrl:\n${imageUrl}`)
  }
}
