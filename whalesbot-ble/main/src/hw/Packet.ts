export const STATUS_BUSY = 0x10;
export const STATUS_DONE = 0x12;
export const STATUS_UNKNOW = 0x14;

export class Respones {
  cmd: number;
  args: number[];
  status: number;
  err: number;
  requestId: number;

  constructor() {
    this.cmd = 0;
    this.args = [0.0, 0.0, 0.0];
    this.status = 0;
    this.err = 0;
    this.requestId = 0;
  }

  static fromBuffer(buffer: Buffer): Respones {
    const obj = new Respones();
    obj.cmd = buffer.readUInt8(2);

    for (let index = 0; index < 3; index++) {
      obj.args[index] = buffer.readFloatLE(3 + index * 4);
    }

    obj.status = buffer.readUInt8(15);
    obj.err = buffer.readUint8(16);
    obj.requestId = buffer.readUint8(17);
    return obj;
  }
}

export class Packet {
  request_id = 0;

  public nextRequestId(): number {
    this.request_id += 1;
    this.request_id = this.request_id & 0xff;
    return this.request_id;
  }

  public allocCmdFromId(cmdId: number): Buffer {
    let buffer = Buffer.alloc(20, 0);
    buffer.writeUInt8(0x77, 0);
    buffer.writeUInt8(0x68, 1);
    buffer.writeUInt8(cmdId, 2);

    return buffer;
  }

  public checksum = (buf: number[] | Buffer, begin: number, end: number) => {
    let c = 0;
    //const list = [];
    for (let i = begin; i <= end; i++) {
      c += buf[i];
      c = c & 0xff;
      //list.push(c);
    }
    //console.log("checksum", list);
    return ~c & 0xff;
  };

  public packCmd(cmd: number, args: number[]): Buffer {
    const buffer = this.allocCmdFromId(cmd);

    for (let index = 0; index < args.length && index < 4; index++) {
      const arg = args[index];
      if (index == 3) {
        buffer.writeInt16LE(arg, 15);
      } else {
        buffer.writeFloatLE(arg * 1.0, 3 + index * 4);
      }
    }

    buffer.writeUInt8(this.nextRequestId(), 17);

    buffer.writeUInt8(this.checksum(buffer, 2, 18), 19); //0x770x68 校验码

    return buffer;
  }

  public packMXCmd(requestId: number, cmd: number, args: number[]): Buffer {
    const buffer = Buffer.alloc(20, 0);

    for (let index = 0; index < args.length && index < 4; index++) {
      const arg = args[index];
      if (index == 3) {
        buffer.writeInt16LE(arg, 18);
      } else {
        buffer.writeFloatLE(arg, 6 + index * 4);
      }
    }

    buffer.writeUInt8(requestId, 20);

    buffer.writeUInt8(this.checksum(buffer, 5, 21), 22); //0x770x68 校验码

    buffer.writeUInt8(this.checksum(buffer, 2, 152), 153); //0x770x68 校验码

    return buffer;
  }
}

export const packet = new Packet();
