/* eslint-disable @typescript-eslint/naming-convention */
import { EventEmitter } from 'eventemitter3';
import { ServiceHelper } from '../ServiceHelper.js';

export enum BasicIoCharacteristic {
  tx = '49535343-8841-43f4-a8d4-ecbe34729bb3',
  rx = '49535343-1e4d-4bd9-ba61-23c647249616',
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
  public static uuid = '49535343-fe7d-4ae5-8fa9-9fafd205e455';

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
    await this.helper.handleListener(
      'receive',
      BasicIoCharacteristic.rx,
      this.receiveHandler.bind(this),
    );
  }

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
