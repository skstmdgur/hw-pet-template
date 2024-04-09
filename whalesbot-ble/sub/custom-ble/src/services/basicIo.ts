/* eslint-disable @typescript-eslint/naming-convention */
import { EventEmitter } from 'eventemitter3';
import { ServiceHelper } from '../ServiceHelper.js';

export enum BasicIoCharacteristic {
  tx = '6e400002-b5a3-f393-e0a9-e50e24dcca9e',
  rx = '6e400003-b5a3-f393-e0a9-e50e24dcca9e',
}

/**
 * Events raised by the BasicIo service
 */
export interface BasicIoEvents {
  newListener: keyof BasicIoEvents;

  removeListener: keyof BasicIoEvents;

  /**
   * Serial data received event
   */
  receive: Uint8Array;
}

/**
 * BasicIoService
 */
export class BasicIoService extends EventEmitter {
  public static uuid = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';

  public static async create(service: BluetoothRemoteGATTService): Promise<BasicIoService> {
    const bluetoothService = new BasicIoService(service);
    await bluetoothService.init();
    return bluetoothService;
  }

  helper: ServiceHelper;

  constructor(service: BluetoothRemoteGATTService) {
    super();
    this.helper = new ServiceHelper(service, this);
  }

  private async init(): Promise<void> {
    // console.warn('BasicIoService.init()');
    await this.helper.handleListener(
      'receive',
      BasicIoCharacteristic.rx,
      this.receiveHandler.bind(this),
    );
  }

  startReceive = (): void => {
    this.emit('newListener', 'receive');
  };

  stopReceive = (): void => {
    this.emit('removeListener', 'receive');
  };

  /**
   * Send serial data
   * @param value - The buffer to send
   */
  public async send(value: BufferSource): Promise<void> {
    return this.helper.setCharacteristicValue(BasicIoCharacteristic.tx, value);
  }

  public async read(): Promise<void> {
    await this.helper.getCharacteristicValue(BasicIoCharacteristic.rx);
  }

  private receiveHandler(event: Event): void {
    const view = (event.target as BluetoothRemoteGATTCharacteristic).value!;
    const value = new Uint8Array(view.buffer);
    this.emit('receive', value);
  }
}
