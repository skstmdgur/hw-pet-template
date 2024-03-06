import log from '@/log';
import { createNumberArray } from '@/util/misc';
import type { HPetNotifiyEventDefinition } from '@ktaicoder/hw-pet';
import {
  HPetNotifyEventKeys,
  type ConnectionState,
  type IHPetCommandRunner,
  type IHPetContext,
  type IParentSender,
} from '@ktaicoder/hw-pet';
import * as altinolite from '@repo/altinolite-ble';
import { sleepAsync } from '@repo/ui';
import type { EventEmitter } from 'eventemitter3';
import type { Observable } from 'rxjs';
import {
  BehaviorSubject,
  Subject,
  Subscription,
  concatMap,
  filter,
  from,
  interval,
  take,
  takeUntil,
} from 'rxjs';
import { SaeonAltinoLiteParser } from './SaeonAltinoLiteParser';
import { AltinoLightOutput } from './altino-lite-utils';

const TRACE = false;
const TX_INTERVAL = 50;

function createDefaultTxBytes(): number[] {
  return createNumberArray(22, (arr) => {
    arr[0] = 2;
    arr[1] = 16;
    arr[2] = 0;
    arr[3] = 1;
    arr[4] = 1;
    arr[21] = 3;
  });
}

/**
 * Class for sending commands to the hardware.
 * Add the necessary commands here.
 * Write the method names the same as the commands.
 *
 * Lifecycle methods: init(), destroy()
 * Mandatory implementation methods: getConnectionState(), getHwId(), connect(), disconnect()
 * Additional commands are the remaining methods other than the ones mentioned above (e.g., echo).
 */
export class CommandRunnerBase implements IHPetCommandRunner {
  private stopped$ = new BehaviorSubject(false);

  private forceStopping_ = false;

  protected connectionState: ConnectionState = 'disconnected';

  protected hwId: string;

  protected toParent: IParentSender;

  protected notifyEvents: EventEmitter<HPetNotifiyEventDefinition>;

  protected bluetoothDevice: BluetoothDevice | undefined;

  protected services: altinolite.Services | undefined;

  protected output = new AltinoLightOutput();

  private deviceRawData$ = new Subject<Uint8Array>();

  private txLoopDisposeFn_?: VoidFunction;

  private rxLoopDisposeFn_?: VoidFunction;

  protected sensors = {
    CDS: 0,
    IR1: 0,
    IR2: 0,
    IR3: 0,
    IR4: 0,
    IR5: 0,
    IR6: 0,
    BAT: 0,
  };

  private txBytes = createDefaultTxBytes();

  // 부모 프레임과 주고 받는 모든 명령은 commandEvents로 모니터링 할 수 있습니다.
  // private commandEvents: EventEmitter<HPetCommandEventDefinition>;

  // iframe 화면과 CommandRunner 사이에 uiEvent를 사용할 수 있습니다.
  // private uiEvents: EventEmitter;

  constructor(options: IHPetContext) {
    const { hwId, toParent, commandEvents, notifyEvents, uiEvents } = options;
    this.hwId = hwId;
    this.toParent = toParent;
    this.notifyEvents = notifyEvents;
    // this.commandEvents = commandEvents;
    // this.uiEvents = uiEvents;
  }

  /**
   * Lifecycle function, Automatically called.
   * An essential function that must be implemented.
   * Called once before communicating with parent frame (CODINY).
   * Initialization tasks, such as registering event listeners, can be performed here.
   */
  init = async (): Promise<void> => {
    log.debug('CommandRunner.init()');
  };

  /**
   * Lifecycle function, Automatically called.
   * An essential function that must be implemented.
   * Called once after the connection with the hardware is terminated.
   * Cleanup tasks, such as unregistering event listeners, can be performed here.
   */
  destroy = async () => {
    log.debug('CommandRunner.destroy()');
  };

  private ensureDisconnected_ = async () => {
    for (let i = 0; this.connectionState === 'connected'; i++) {
      if (i > 100) {
        // give up
        break;
      }
      console.log('wait until disconnected');
      await new Promise((resolve) => {
        setTimeout(resolve, 50);
      });
    }
  };

  /**
   * Update the connection state variable,
   * emit an event if the connection state has changed,
   * and notify the parent frame (CODINY).
   * @param state - The connection state
   */
  private updateConnectionState_ = (state: ConnectionState) => {
    if (state !== this.connectionState) {
      this.connectionState = state;
      this.notifyEvents.emit(HPetNotifyEventKeys.connectionStateChanged, this.connectionState);

      // notify to parent frame (CODINY)
      this.toParent.notifyConnectionState(this.connectionState);
    }
  };

  /**
   * command: getConnectionState
   *
   * get current connection state
   * An essential function that must be implemented.
   * The return value is automatically sent to the parent frame (CODINY)
   * @returns ConnectionState - connection state
   */
  getConnectionState = async (): Promise<ConnectionState> => {
    return this.connectionState;
  };

  /**
   * command: getHwId
   *
   * get hardware id
   * An essential function that must be implemented.
   * The return value is automatically sent to the parent frame (CODINY)
   * @returns string - hwId
   */
  getHwId = async (): Promise<string> => {
    return this.hwId;
  };

  /**
   * command: connect
   *
   * Function to connect to the hardware.
   * Check the connection status in ricConnector.setEventListener().
   * An essential function that must be implemented.
   * @returns The return value is meaningless.
   */
  connect = async (): Promise<boolean> => {
    await this.disconnect();
    await this.ensureDisconnected_();

    // connect bluetooth device
    let device: BluetoothDevice | undefined;
    try {
      device = await altinolite.requestDevice(window.navigator.bluetooth);
    } catch (ignore) {
      // ignore
    }

    if (!device) {
      this.stopped$.next(true);
      return false;
    }

    this.stopped$.next(false);
    this.updateConnectionState_('connecting');
    this.bluetoothDevice = device;
    const services = await altinolite.getServices(device);
    this.services = services;

    await this.onConnected_(device, services);

    return true;
  };

  private onConnected_ = async (
    bluetoothDevice: BluetoothDevice,
    services: altinolite.Services,
  ) => {
    this.bluetoothDevice = bluetoothDevice;
    this.services = services;
    this.updateConnectionState_('connected');
    bluetoothDevice.addEventListener('gattserverdisconnected', this.onDisconnected_);

    this.rxLoop_(services);
    this.txLoop_();
  };

  private onDisconnected_ = async () => {
    console.log('onDisconnected_');
    this.rxLoopDisposeFn_?.();
    this.rxLoopDisposeFn_ = undefined;
    this.txLoopDisposeFn_?.();
    this.txLoopDisposeFn_ = undefined;

    this.bluetoothDevice = undefined;
    const ioService = this.services?.basicIoService;
    if (ioService) {
      ioService.stopReceive();
    }
    this.services = undefined;
    this.stopped$.next(true);
    this.updateConnectionState_('disconnected');
  };

  private onReceive_ = (pkt: Uint8Array) => {
    // console.log('onReceive_', pkt);
    // validate packet length
    if (pkt.length < 22) {
      console.info(`onReceive_() invalid pkt.length: ${pkt.length} byte`);
      return;
    }
    // validate packet start mark and end mark
    if (pkt[0] !== 2 || pkt[21] !== 3) {
      console.info(
        `onReceive_() invalid packet start,end mark(buf[0]=${pkt[0]}, buf[21]=${pkt[21]}`,
      );
      return;
    }

    function u16(index: number) {
      const high = pkt[index] & 0xff;
      const low = pkt[index + 1] & 0xff;
      return (high << 8) | low;
    }

    // copy the value of the packet to the sensor
    this.sensors.IR1 = u16(5);
    this.sensors.IR2 = u16(7);
    this.sensors.IR3 = u16(9);
    this.sensors.IR4 = u16(11);
    this.sensors.IR5 = u16(13);
    this.sensors.IR6 = u16(15);
    this.sensors.CDS = u16(17);
    this.sensors.BAT = u16(19);

    // next read
    const uartService = this.services?.basicIoService;
    if (uartService) {
      uartService.read();
    }
  };

  /**
   * update checksums
   */
  private updateCksum_(array: number[]) {
    let cksum = 0;
    for (let i = 3; i < 21; i++) {
      cksum += array[i];
    }
    array[2] = cksum & 0xff;
  }

  /**
   * Send values to the device
   */
  protected writeRaw_ = async (values: number[] | Uint8Array): Promise<void> => {
    const uartService = this.services?.basicIoService;
    if (uartService) {
      if (Array.isArray(values)) {
        await uartService.send(new Uint8Array(values));
      } else {
        await uartService.send(values);
      }
    }
  };

  /**
   * Write an output object to a device
   */
  private writeOutput_ = async (): Promise<any> => {
    if (this.forceStopping_) return;
    if (this.stopped$.value) {
      if (TRACE) console.log('stopped');
      return;
    }

    this.txBytes[5] = this.output.STR;
    this.txBytes[6] = (this.output.RM & 0xff00) >> 8;
    this.txBytes[7] = this.output.RM & 0xff;
    this.txBytes[8] = (this.output.LM & 0xff00) >> 8;
    this.txBytes[9] = this.output.LM & 0xff;
    this.txBytes[10] = this.output.CHAR;
    this.txBytes[11] = this.output.DM1;
    this.txBytes[12] = this.output.DM2;
    this.txBytes[13] = this.output.DM3;
    this.txBytes[14] = this.output.DM4;
    this.txBytes[15] = this.output.DM5;
    this.txBytes[16] = this.output.DM6;
    this.txBytes[17] = this.output.DM7;
    this.txBytes[18] = this.output.DM8;
    this.txBytes[19] = this.output.NOTE;
    this.txBytes[20] = this.output.LED;
    this.updateCksum_(this.txBytes);
    // if (TRACE) console.log('TX', this.txBytes)
    await this.writeRaw_(this.txBytes).catch((err) => {
      console.info(`write fail: ${err.message}`);
    });
  };

  /**
   * force stop
   */
  private forceStopAll_ = async () => {
    this.forceStopping_ = true;
    try {
      for (let i = 0; i < 2; i++) {
        // Update the output object to stop for the txLoop.
        this.output.updateForStopAll();

        if (i > 0) await sleepAsync(TX_INTERVAL);

        // create a new array and immediately write.
        const bytes = createDefaultTxBytes();
        this.updateCksum_(bytes);

        // write
        if (TRACE) console.log('TX', bytes);
        await this.writeRaw_(bytes).catch((err) => {
          console.info(`ignore, forceStopAll_() write fail: ${err.message}`);
        });
      }
    } catch (err) {
      // ignore
    } finally {
      this.forceStopping_ = false;
    }
  };

  /**
   * Observable's destroy trigger
   */
  private closeTrigger_ = (): Observable<any> => {
    return this.stopped$.pipe(filter(Boolean), take(1));
  };

  private rxLoop_ = (services: altinolite.Services) => {
    console.log('rxLoop_() start');
    // rxloop
    const subscription = new Subscription();
    subscription.add(
      this.deviceRawData$.pipe(SaeonAltinoLiteParser.parse()).subscribe((data) => {
        this.onReceive_(data);
      }),
    );

    const ioService = services.basicIoService;
    if (ioService) {
      ioService.startReceive();
      ioService.on('receive', (pkt: Uint8Array) => {
        this.deviceRawData$.next(pkt);
      });
    } else {
      console.warn('ioService is null');
    }

    this.rxLoopDisposeFn_ = () => {
      subscription.unsubscribe();
      if (ioService) {
        ioService.stopReceive();
      }
    };
  };

  /**
   * Periodically send output objects to devices
   */
  private txLoop_ = () => {
    console.log('txLoop_() start');
    const subscription = new Subscription();
    subscription.add(
      interval(TX_INTERVAL)
        .pipe(
          concatMap(() => from(this.writeOutput_())),
          takeUntil(this.closeTrigger_()),
        )
        .subscribe(),
    );
    this.txLoopDisposeFn_ = () => {
      subscription.unsubscribe();
    };
  };

  /**
   * command: disconnect
   *
   * Function to disconnect from the hardware.
   * An essential function that must be implemented.
   * @returns The return value is meaningless.
   */
  disconnect = async () => {
    const device = this.bluetoothDevice;
    if (!device) {
      console.log('There is no device connected.');
      return;
    }

    const gatt = device.gatt;
    if (gatt) {
      if (gatt.connected) {
        await this.forceStopAll_();
        gatt.disconnect();
      }
      if (!gatt.connected) {
        console.info('disconnect OK');
      }
    }
  };
}
