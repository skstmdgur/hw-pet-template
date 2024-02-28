import { CommandRunnerBase } from './CommandRunnerBase'

/**
 * Inherits from the CommandRunnerBase class.
 * CommandRunnerBase handles the aspects related to the connection with hardware,
 * and this class handles the remaining commands that are sent to the hardware.
 */

export class CommandRunner extends CommandRunnerBase {
  async stop(option: string): Promise<void> {
    const output = this.output
    console.log(`stop(${option})`)
    if (option == 'All') {
      output.updateForStopAll()
    } else if (option == 'Window') {
      output.CONTROL &= 0xfe
    } else if (option == 'Fan') {
      output.CONTROL &= 0xfd
    } else if (option == 'Pump') {
      output.CONTROL &= 0xfb
    } else if (option == 'Heater') {
      output.CONTROL &= 0xf7
    } else if (option == 'Cam') {
      output.CONTROL &= 0x0f
    } else if (option == 'Led') {
      output.LED1 = 0
      output.LED2 = 0
      output.LED3 = 0
      output.LED4 = 0
      output.LED5 = 0
      output.LED6 = 0
    } else if (option == 'Display') {
      output.DIS1 = 0
      output.DIS2 = 0
      output.DIS3 = 0
      output.DIS4 = 0
      output.DIS5 = 0
      output.DIS6 = 0
      output.DIS7 = 0
      output.DIS8 = 0
      output.DIS9 = 0
    }
  }

  async sensor(option: string): Promise<number> {
    console.log(`sensor(${option})`)
    const value = this.sensors[option]
    if (typeof value === 'undefined') {
      console.log('sensor() invalid option:', option)
      return 0
    }
    return value
  }

  async switch(idx: string): Promise<boolean> {
    let value = false
    console.log(`switch number (${idx})`)
    const sensors = this.sensors
    if (idx == '1') {
      if (sensors.SW1 == 0) value = false
      if (sensors.SW1 == 1) value = true
    }
    if (idx == '2') {
      if (sensors.SW2 == 0) value = false
      if (sensors.SW2 == 1) value = true
    }
    if (idx == '3') {
      if (sensors.SW3 == 0) value = false
      if (sensors.SW3 == 1) value = true
    }
    return value
  }

  async window(option: string): Promise<void> {
    console.log(`window(${option})`)
    const output = this.output
    if (option == 'Open') {
      output.CONTROL |= 0x01
    } else if (option == 'Close') {
      output.CONTROL &= 0xfe
    }
  }

  async fan(option: string): Promise<void> {
    console.log(`fan(${option})`)
    const output = this.output
    if (option == 'On') {
      output.CONTROL |= 0x02
    } else if (option == 'Off') {
      output.CONTROL &= 0xfd
    }
  }

  async pump(option: string): Promise<void> {
    console.log(`pump(${option})`)
    const output = this.output
    if (option == 'On') {
      output.CONTROL |= 0x04
    } else if (option == 'Off') {
      output.CONTROL &= 0xfb
    }
  }

  async heater(option: string): Promise<void> {
    console.log(`heater(${option})`)
    const output = this.output
    if (option == 'On') {
      output.CONTROL |= 0x08
    } else if (option == 'Off') {
      output.CONTROL &= 0xf7
    }
  }

  async cam(angle: number): Promise<void> {
    console.log(`cam(${angle})`)
    const output = this.output
    if (angle < 0) angle = 0
    if (angle > 15) angle = 15

    output.CONTROL &= 0x0f
    output.CONTROL |= (angle << 4) & 0xf0
  }

  async led(idx: string, red: string, green: string, blue: string): Promise<void> {
    const output = this.output
    const _idx = Number(idx)
    const _red = Number(red)
    const _green = Number(green)
    const _blue = Number(blue)

    if (_idx == null) return
    if (_idx < 1) return
    if (_idx > 4) return

    if (red == null) return
    if (_red < 0) return
    if (_red > 15) return

    if (green == null) return
    if (_green < 0) return
    if (_green > 15) return

    if (blue == null) return
    if (_blue < 0) return
    if (_blue > 15) return

    let dst = 0
    let msk = 0xfff
    let org = 0

    dst |= _blue
    dst = (dst << 4) | _green
    dst = (dst << 4) | _red

    dst = dst << (((_idx - 1) % 2) * 12)
    msk = msk << (((_idx - 1) % 2) * 12)

    if (_idx == 1 || _idx == 2) {
      org = output.LED3
      org = (org << 8) | output.LED2
      org = (org << 8) | output.LED1

      org &= ~msk
      org |= dst

      output.LED1 = org & 0xff
      output.LED2 = (org >> 8) & 0xff
      output.LED3 = (org >> 16) & 0xff
    }

    if (_idx == 3 || _idx == 4) {
      org = output.LED6
      org = (org << 8) | output.LED5
      org = (org << 8) | output.LED4

      org &= ~msk
      org |= dst

      output.LED4 = org & 0xff
      output.LED5 = (org >> 8) & 0xff
      output.LED6 = (org >> 16) & 0xff
    }
  }

  async ledNumber(idx: number, red: number, green: number, blue: number): Promise<void> {
    const output = this.output
    if (idx == null) return
    if (idx < 1) return
    if (idx > 4) return

    if (red == null) return
    if (red < 0) return
    if (red > 15) return

    if (green == null) return
    if (green < 0) return
    if (green > 15) return

    if (blue == null) return
    if (blue < 0) return
    if (blue > 15) return

    let dst = 0
    let msk = 0xfff
    let org = 0

    dst |= blue
    dst = (dst << 4) | green
    dst = (dst << 4) | red

    dst = dst << (((idx - 1) % 2) * 12)
    msk = msk << (((idx - 1) % 2) * 12)

    if (idx == 1 || idx == 2) {
      org = output.LED3
      org = (org << 8) | output.LED2
      org = (org << 8) | output.LED1

      org &= ~msk
      org |= dst

      output.LED1 = org & 0xff
      output.LED2 = (org >> 8) & 0xff
      output.LED3 = (org >> 16) & 0xff
    }

    if (idx == 3 || idx == 4) {
      org = output.LED6
      org = (org << 8) | output.LED5
      org = (org << 8) | output.LED4

      org &= ~msk
      org |= dst

      output.LED4 = org & 0xff
      output.LED5 = (org >> 8) & 0xff
      output.LED6 = (org >> 16) & 0xff
    }
  }

  async display(st: string): Promise<void> {
    const output = this.output
    st = st.replace(/“ | ”/g, '')

    if (st == null) return
    if (st.length == 0) return

    if (st.length > 9) st = st.substring(0, 9)

    const buf = [0]
    buf.length = 0

    for (let i = 0; i < st.length; i++) {
      const asciiValue = st.charCodeAt(i)
      buf.push(asciiValue)
    }

    console.log(buf)
    const stArr = [
      output.DIS1,
      output.DIS2,
      output.DIS3,
      output.DIS4,
      output.DIS5,
      output.DIS6,
      output.DIS7,
      output.DIS8,
      output.DIS9,
    ]

    for (let i = 0; i < 9; i++) {
      stArr[i] = 32
    }

    for (let i = 0; i < buf.length; i++) {
      stArr[i] = buf[i]
    }

    output.DIS1 = stArr[0]
    output.DIS2 = stArr[1]
    output.DIS3 = stArr[2]
    output.DIS4 = stArr[3]
    output.DIS5 = stArr[4]
    output.DIS6 = stArr[5]
    output.DIS7 = stArr[6]
    output.DIS8 = stArr[7]
    output.DIS9 = stArr[8]

    console.log(this.txBytes[12])
    console.log(this.txBytes[13])
    console.log(this.txBytes[14])
    console.log(this.txBytes[15])
    console.log(this.txBytes[16])
    console.log(this.txBytes[17])
    console.log(this.txBytes[18])
    console.log(this.txBytes[19])
    console.log(this.txBytes[20])
  }
}
