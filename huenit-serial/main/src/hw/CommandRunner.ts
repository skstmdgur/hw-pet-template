import { CommandRunnerBase } from './CommandRunnerBase'
import axios from 'axios';

/**
 * Inherits from the CommandRunnerBase class.
 * CommandRunnerBase handles the aspects related to the connection with hardware,
 * and this class handles the remaining commands that are sent to the hardware.
 */

export class CommandRunner extends CommandRunnerBase {
  // port: SerialPort | null = null; 
  port: any

  setPort(port: any) {
    this.port = port;
  }

  private chr(ch: string): number {
    return ch.charCodeAt(0);
  }

  private numToChrArray(num: number): number[] {
      return num.toString().split('').map(digit => this.chr(digit));
  }

  private strToAsciiArray(str: string): number[] {
      return Array.from(str).map(char => char.charCodeAt(0));
  }

  async eye(): Promise<void> {
    const pkt = [this.chr('G'), this.chr('0'), this.chr('X'), this.chr('0'), this.chr('Y'), this.chr('2'), this.chr('0'), this.chr('0'),
    this.chr('Z'), this.chr('0'), this.chr('\n'), this.chr('G'), this.chr('0'), this.chr('X'), this.chr('0'), this.chr('Y'), this.chr('2'), this.chr('5'), this.chr('0'),
    this.chr('Z'), this.chr('0'), this.chr('\n')];

    await this.sendCommand(new Uint8Array(pkt));
  }

  async robotHome(): Promise<void> {
      const pkt = this.strToAsciiArray('M1008A5\n');

      await this.sendCommand(new Uint8Array(pkt));
  }

  async moveG0(x: number, y: number, z: number): Promise<void> {
    const pkt = [this.chr('G'), this.chr('0'), this.chr('X'), ...this.numToChrArray(x), this.chr('Y'), ...this.numToChrArray(y),
    this.chr('Z'), ...this.numToChrArray(z), this.chr('\n')];

    await this.sendCommand(new Uint8Array(pkt));
}

  async suctionOn(): Promise<void> {
      const pkt = this.strToAsciiArray('M1401A0\nM1400A1023\n');

      await this.sendCommand(new Uint8Array(pkt));
  }

  async suctionOff(): Promise<void> {
      let pkt1 = this.strToAsciiArray('M1400A0\nM1401A1\n');

      await this.sendCommand(new Uint8Array(pkt1));

      // Wait for 300 milliseconds
      await new Promise(resolve => setTimeout(resolve, 300));

      let pkt2 = this.strToAsciiArray('M1401A0\n');

      await this.sendCommand(new Uint8Array(pkt2));
  }

  async timeSleep(t: number): Promise<void> {
      await new Promise(resolve => setTimeout(resolve, t * 1000));
  }

    

  async sendCommand(data: Uint8Array): Promise<void> {
    if (this.port && this.port.writable) {
      const writer = this.port.writable.getWriter();
      await writer.write(data);
      writer.releaseLock();
      console.log('Data sent to serial port', data);
    } else {
      console.error('Serial port not connected or not writable');
    }
  }


  sendTestData = async (): Promise<string> => {
    try {
      if (this.port && this.port.writable) {
        const writer = this.port.writable.getWriter();
        const encoder = new TextEncoder();
        const data = encoder.encode('M1008A5');
        await writer.write(data);
        writer.releaseLock();
        console.log('Serial data sent');
        return 'success';
      } else {
        console.error('Serial port not connected or not writable');
        return 'not connect';
      }
    } catch (error) {
      console.error('Error sending test data:', error);
      return 'sending error';
    }
  };

  teststart =async (): Promise<string> => {
    try {
      // 예시로 사용할 임시 URL
      const apiUrl = 'https://jsonplaceholder.typicode.com/posts';

      // POST 요청을 보낼 데이터
      const postData = {
        title: 'foo',
        body: 'bar',
        userId: 1,
        // ... 추가 필요한 데이터
      };

      // POST 요청 보내기
      const response = await axios.post(apiUrl, postData);

      // API 응답에서 원하는 정보 추출
      const resultData = response.data.id;

      // 결과값을 로깅하거나 다른 작업을 수행할 수 있습니다.
      console.log('중심좌표 :', resultData);

      // 성공 메시지를 반환
      return resultData;

    } catch (error) {
      // 오류 처리
      console.error('API 호출 오류:', error);
      throw new Error('API 호출 중 오류가 발생했습니다.');
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
}
