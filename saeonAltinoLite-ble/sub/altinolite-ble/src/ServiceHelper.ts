import type { EventEmitter } from 'eventemitter3';
import { PromiseQueue } from './PromiseQueue.js';

export interface ServiceEventHandler {
  characteristic: BluetoothCharacteristicUUID;
  handler: (event: Event) => void;
}

export class ServiceHelper {
  private static queue = new PromiseQueue();

  private characteristics?: BluetoothRemoteGATTCharacteristic[];

  constructor(
    private service: BluetoothRemoteGATTService,
    private emitter?: EventEmitter,
  ) {
    // empty
  }

  private async getCharacteristic(
    uuid: BluetoothCharacteristicUUID,
  ): Promise<BluetoothRemoteGATTCharacteristic | undefined> {
    if (!this.characteristics) {
      this.characteristics = await this.service.getCharacteristics();
    }

    return this.characteristics.find((characteristic) => characteristic.uuid === uuid);
  }

  public async getCharacteristicValue(uuid: BluetoothCharacteristicUUID): Promise<DataView> {
    const characteristic = await this.getCharacteristic(uuid);

    if (!characteristic) {
      throw new Error('Unable to locate characteristic');
    }

    return await ServiceHelper.queue.add(async () => await characteristic.readValue());
  }

  public async setCharacteristicValue(
    uuid: BluetoothCharacteristicUUID,
    value: BufferSource,
  ): Promise<void> {
    const characteristic = await this.getCharacteristic(uuid);

    if (!characteristic) {
      throw new Error('Unable to locate characteristic');
    }

    await ServiceHelper.queue.add(async () => characteristic.writeValue(value));
  }

  public async handleListener(
    event: string,
    uuid: BluetoothCharacteristicUUID,
    handler: (event: Event) => void,
  ): Promise<void> {
    const characteristic = await this.getCharacteristic(uuid);

    if (!characteristic) {
      return;
    }

    await ServiceHelper.queue.add(async () => characteristic.startNotifications());

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    this.emitter!.on('newListener', (emitterEvent: string) => {
      if (emitterEvent !== event || this.emitter!.listenerCount(event) > 0) {
        return;
      }

      return ServiceHelper.queue.add(async () =>
        { characteristic.addEventListener('characteristicvaluechanged', handler); },
      );
    });

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    this.emitter!.on('removeListener', (emitterEvent: string) => {
      if (emitterEvent !== event || this.emitter!.listenerCount(event) > 0) {
        return;
      }

      return ServiceHelper.queue.add(async () => {
        characteristic.removeEventListener('characteristicvaluechanged', handler);
      });
    });
  }

  public async dump(): Promise<void> {
    try {
      const characteristics = await this.service.getCharacteristics();
      for (const ch of characteristics) {
        console.log(ch.uuid, ch.properties);
      }
    } catch (err) {
      console.log('dump error:', err);
    }
  }
}
