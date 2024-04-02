import { BasicIoService } from './services/basicIo.js';

export interface Services {
  basicIoService?: BasicIoService;
}

interface Service {
  uuid: BluetoothCharacteristicUUID;
  create: (service: BluetoothRemoteGATTService) => Promise<any>;
}

class ServiceBuilder {
  constructor(private services: BluetoothRemoteGATTService[]) {}

  public async createService<T>(
    serviceClass: (new (service: BluetoothRemoteGATTService) => T) & Service,
  ): Promise<T | undefined> {
    const found = this.services.find((service) => service.uuid === serviceClass.uuid);

    if (!found) {
      return undefined;
    }

    return await serviceClass.create(found);
  }
}

export const requestDevice = async (bluetooth: Bluetooth): Promise<BluetoothDevice | undefined> => {
  const device = await bluetooth.requestDevice({
    filters: [
      {
        namePrefix: 'LS',
      },
      {
        namePrefix: 'whalesbot',
      },
    ],
    optionalServices: [BasicIoService.uuid],
  });

  return device;
};

export const getServices = async (device: BluetoothDevice): Promise<Services> => {
  if (!device.gatt) {
    return {};
  }

  if (!device.gatt.connected) {
    await device.gatt.connect();
  }

  // const services = await device.gatt.getPrimaryServices()
  // const services = await device.gatt.getPrimaryServices(UartService.uuid)
  const service = await device.gatt.getPrimaryService(BasicIoService.uuid);
  const builder = new ServiceBuilder([service]);

  const uartService = await builder.createService(BasicIoService);

  return {
    basicIoService: uartService,
  };
};
