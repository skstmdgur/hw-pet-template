import { clamp } from '@/util/misc';
import { CommandRunnerBase } from './CommandRunnerBase';
import { LINE_MASKS, NOTE_OCT, NOTE_SCALE, STEERING } from './altino-lite-utils';

/**
 * Inherits from the CommandRunnerBase class.
 * CommandRunnerBase handles the aspects related to the connection with hardware,
 * and this class handles the remaining commands that are sent to the hardware.
 */
export class CommandRunner extends CommandRunnerBase {
  async stop(option: string): Promise<void> {
    console.log(`stop(${option})`);

    const output = this.output;
    if (option == 'All') {
      output.updateForStopAll();
    } else if (option == 'Drive') {
      output.RM = 0;
      output.LM = 0;
    } else if (option == 'Steering') {
      output.STR = 0;
    } else if (option == 'Sound') {
      output.NOTE = 0;
    } else if (option == 'Light') {
      output.LED = 0;
    } else if (option == 'Display') {
      output.CHAR = 0;
      output.DM1 = 0;
      output.DM2 = 0;
      output.DM3 = 0;
      output.DM4 = 0;
      output.DM5 = 0;
      output.DM6 = 0;
      output.DM7 = 0;
      output.DM8 = 0;
    }
  }

  async go(lp: number, rp: number): Promise<void> {
    console.log(`go(${lp}, ${rp})`);
    this.output.LM = clamp(lp, -1000, 1000);
    this.output.RM = clamp(rp, -1000, 1000);
  }

  async steering(option: string): Promise<void> {
    console.log(`steering(${option}) = ${STEERING[option]}`);
    const value = STEERING[option];
    if (typeof value !== 'number') {
      console.log(`steering() invalid option: ${option}`);
      return;
    }
    this.output.STR = clamp(value, -127, 127);
  }

  async steeringNumber(value: number): Promise<void> {
    console.log(`steeringNumber(${value})`);
    this.output.STR = clamp(value, -127, 127);
  }

  async sensor(option: string): Promise<number> {
    console.log(`sensor(${option})`);
    const value = this.sensors[option];
    if (typeof value === 'undefined') {
      console.log('sensor() invalid option:', option);
      return 0;
    }
    return value;
  }

  async light(fn: string, state: string): Promise<void> {
    console.log(`light(${fn}, ${state})`);
    const output = this.output;
    if (state == 'On') {
      if (fn == 'Forward') {
        output.LED |= 0x01;
      } else if (fn == 'Brake') {
        output.LED |= 0x02;
      } else if (fn == 'Turn left') {
        output.LED |= 0x04;
      } else if (fn == 'Turn right') {
        output.LED |= 0x08;
      }
    } else if (state == 'Off') {
      if (fn == 'Forward') {
        output.LED &= 0xfe;
      } else if (fn == 'Brake') {
        output.LED &= 0xfd;
      } else if (fn == 'Turn left') {
        output.LED &= 0xfb;
      } else if (fn == 'Turn right') {
        output.LED &= 0xf7;
      }
    }
  }

  async lightHex(hex: number): Promise<void> {
    console.log(`lightHex(${hex})`);
    this.output.LED = hex;
  }

  async sound(oct: string, scale: string): Promise<void> {
    console.log(`sound(${oct}, ${scale}): nOct=${NOTE_OCT[oct]}, nScale=${NOTE_SCALE[scale]}`);
    const nOct = NOTE_OCT[oct];
    if (typeof nOct === 'undefined') return;

    const nScale = NOTE_SCALE[scale];
    if (typeof nScale === 'undefined') return;

    this.output.NOTE = nScale == 0 ? 0 : (nOct - 1) * 12 + nScale;
    console.log('sound');
  }

  async soundNumber(scale: number): Promise<void> {
    console.log(`soundNumber(${scale})`);

    if (scale < 0 || scale > 96) {
      console.log(`soundNumber() invalid scale:${scale}`);
      return;
    }
    this.output.NOTE = scale;
    console.log('soundNumber');
  }

  async displayChar(ch: string): Promise<void> {
    console.log(`displayChar(${ch})`);
    if (ch.length < 1) {
      console.log(`displayChar() invalid ch:${ch}`);
      return;
    }

    const character = ch.replace(/“ | ”/g, '');

    if (character.length === 0) {
      console.log('displayChar() ch is empty:' + ch);
      return;
    }

    this.output.CHAR = character.charCodeAt(0);
    console.log('displayChar : ' + character.charCodeAt(0));
  }

  async displayLine(
    line: string,
    bit0: string,
    bit1: string,
    bit2: string,
    bit3: string,
    bit4: string,
    bit5: string,
    bit6: string,
    bit7: string,
  ): Promise<void> {
    console.log(
      `displayLine(${line}, ${bit0}, ${bit1}, ${bit2}, ${bit3}, ${bit4}, ${bit5}, ${bit6}, ${bit7})`,
    );

    // disable ascii mode
    this.output.CHAR = 0xff;
    const lineMask = LINE_MASKS[line];
    if (typeof lineMask !== 'number') {
      console.log('displayLine() invalid line: ' + line);
      return;
    }

    function maskFn(dm: number, bit: string) {
      if (bit === 'On') return dm | lineMask;
      if (bit === 'Off') return dm & ~lineMask;
      console.log(`displayLine() invalid bit:${bit}`);
      return null;
    }

    const bits = [bit0, bit1, bit2, bit3, bit4, bit5, bit6, bit7];
    const dmKeys = ['DM8', 'DM7', 'DM6', 'DM5', 'DM4', 'DM3', 'DM2', 'DM1'];
    bits.forEach((bit, i) => {
      const dmKey = dmKeys[i];
      const v = maskFn(this.output[dmKey], bit);
      if (v == null) return;
      this.output[dmKey] = v;
    });
  }

  async display(
    line1: number,
    line2: number,
    line3: number,
    line4: number,
    line5: number,
    line6: number,
    line7: number,
    line8: number,
  ): Promise<void> {
    console.log(
      `display(${line1}, ${line2}, ${line3}, ${line4}, ${line5}, ${line6}, ${line7}, ${line8})`,
    );
    const output = this.output;
    output.CHAR = 0xff; // disable ascii mode
    output.DM8 = line1;
    output.DM7 = line2;
    output.DM6 = line3;
    output.DM5 = line4;
    output.DM4 = line5;
    output.DM3 = line6;
    output.DM2 = line7;
    output.DM1 = line8;
  }

  async display_on(x: number, y: number): Promise<void> {
    console.log(`display_on(${x}, ${y})`);

    if (x < 1 || x > 8) {
      console.log(`display_on() invalid x:${x}`);
      return;
    }

    if (y < 1 || y > 8) {
      console.log(`display_on() invalid y:${y}`);
      return;
    }

    const output = this.output;
    output.CHAR = 0xff; // disable ascii mode
    const nX = x - 1;
    const nY = y - 1;
    const mask = 0x01 << nY;
    if (nX == 7) output.DM1 |= mask;
    if (nX == 6) output.DM2 |= mask;
    if (nX == 5) output.DM3 |= mask;
    if (nX == 4) output.DM4 |= mask;
    if (nX == 3) output.DM5 |= mask;
    if (nX == 2) output.DM6 |= mask;
    if (nX == 1) output.DM7 |= mask;
    if (nX == 0) output.DM8 |= mask;
  }

  async display_off(x: number, y: number): Promise<void> {
    console.log(`display_off(${x}, ${y})`);
    if (x < 1 || x > 8) {
      console.log(`display_off() invalid x:${x}`);
      return;
    }

    if (y < 1 || y > 8) {
      console.log(`display_off() invalid y:${y}`);
      return;
    }

    const output = this.output;
    output.CHAR = 0xff; // disable ascii mode
    const nX = x - 1;
    const nY = y - 1;
    const mask = 0x01 << nY;
    if (nX == 7) output.DM1 &= ~mask;
    if (nX == 6) output.DM2 &= ~mask;
    if (nX == 5) output.DM3 &= ~mask;
    if (nX == 4) output.DM4 &= ~mask;
    if (nX == 3) output.DM5 &= ~mask;
    if (nX == 2) output.DM6 &= ~mask;
    if (nX == 1) output.DM7 &= ~mask;
    if (nX == 0) output.DM8 &= ~mask;
  }
}
