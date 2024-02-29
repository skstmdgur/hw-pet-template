import log from '@/log'
import { createNumberArray, errmsg } from '@/util/misc'
import type {
  ConnectionState,
  HPetNotifiyEventDefinition,
  IHPetCommandRunner,
  IHPetContext,
  IParentSender,
} from '@ktaicoder/hw-pet'
import { HPetNotifyEventKeys } from '@ktaicoder/hw-pet'
import type { EventEmitter } from 'eventemitter3'
import type { Observable } from 'rxjs'
import {
  BehaviorSubject,
  EMPTY,
  Subscription,
  concatMap,
  distinctUntilChanged,
  filter,
  from,
  interval,
  sampleTime,
  switchMap,
  take,
  takeUntil,
  tap,
} from 'rxjs'
import { SaeonSmartFarmParser } from './SaeonSmartFarmParser'
import { SmartFarmOutput } from './SmartFarmOutput'
import { WebSerialDevice } from './WebSerialDevice'
import { openSerialDevice } from './command-util'

const TRACE = false
const TX_INTERVAL = 50
const RX_INTERVAL = 50

const chr = (str: string): number => str.charCodeAt(0)

function createDefaultTxBytes(): number[] {
  return createNumberArray(22, (arr) => {
    arr[0] = 2
    arr[1] = 16
    arr[2] = 0
    arr[3] = 1
    arr[4] = 1
    arr[21] = 3
  })
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
  private stopped$ = new BehaviorSubject(false)

  /**
   * 연결 상태
   */
  private connectionState: ConnectionState = 'disconnected'

  /**
   * 하드웨어 ID
   */
  private hwId: string

  /**
   * 부모 프레임에 데이터 전송하는 도우미 객체
   */
  private toParent: IParentSender

  /**
   * 연결 상태 등을 부모 프레임에 notify하기 위한 이벤트 객체
   */
  private notifyEvents: EventEmitter<HPetNotifiyEventDefinition>

  /**
   * 시리얼 디바이스
   */
  private device_?: WebSerialDevice

  /**
   * 강제 중지 여부
   */
  private forceStop_ = false

  /**
   * 연결이 해제될 때 호출될 함수
   */
  private disposeFn_?: VoidFunction

  private txLoopDisposeFn_?: VoidFunction

  private rxLoopDisposeFn_?: VoidFunction

  protected output = new SmartFarmOutput()

  sensors = {
    HUM: 0,
    HEATER: 0,
    TEMP: 0,
    SOIL: 0,
    CDS: 0,
    SW1: 0,
    SW2: 0,
    SW3: 0,
  }

  protected txBytes = createDefaultTxBytes()

  constructor(options: IHPetContext) {
    const { hwId, toParent, commandEvents, notifyEvents, uiEvents } = options

    this.hwId = hwId
    this.toParent = toParent
    this.notifyEvents = notifyEvents
    // commandEvents: 부모 프레임에서 전달되는 명령의 이벤트들
    // notifyEvents: 부모 프레임에 전달하는 연결 상태등의 notification 이벤트들
    // uiEvents: iframe의 ui와 상호작용할 수 있는 이벤트, 필요한 경우에만 사용
  }

  /**
   * Lifecycle function, Automatically called.
   * An essential function that must be implemented.
   * Called once before communicating with parent frame (CODINY).
   * Initialization tasks, such as registering event listeners, can be performed here.
   */
  init = async (): Promise<void> => {
    log.debug('CommandRunner.init()')
  }

  /**
   * Lifecycle function, Automatically called.
   * An essential function that must be implemented.
   * Called once after the connection with the hardware is terminated.
   * Cleanup tasks, such as unregistering event listeners, can be performed here.
   */
  destroy = async () => {
    log.debug('CommandRunner.destroy()')
  }

  /**
   * Update the connection state variable,
   * emit an event if the connection state has changed,
   * and notify the parent frame (CODINY).
   * @param state - The connection state
   */
  private updateConnectionState_ = (state: ConnectionState) => {
    if (state !== this.connectionState) {
      this.connectionState = state
      this.notifyEvents.emit(HPetNotifyEventKeys.connectionStateChanged, this.connectionState)

      // notify to parent frame (CODINY)
      this.toParent.notifyConnectionState(this.connectionState)
    }
  }

  /**
   * command: getConnectionState
   *
   * get current connection state
   * An essential function that must be implemented.
   * The return value is automatically sent to the parent frame (CODINY)
   * @returns ConnectionState - connection state
   */
  getConnectionState = async (): Promise<ConnectionState> => {
    return this.connectionState
  }

  /**
   * command: getHwId
   *
   * get hardware id
   * An essential function that must be implemented.
   * The return value is automatically sent to the parent frame (CODINY)
   * @returns string - hwId
   */
  getHwId = async (): Promise<string> => {
    return this.hwId
  }

  protected registerListeners_ = (device: WebSerialDevice) => {
    const subscription = new Subscription()

    // 디바이스의 상태가 변경될때 콜백 호출
    subscription.add(
      device
        .observeDeviceState()
        .pipe(distinctUntilChanged())
        .subscribe((state) => {
          if (state === 'opened') {
            this.onConnected_(device)
          } else if (state === 'closed') {
            this.onDisconnected_()
          }
        }),
    )

    this.disposeFn_ = () => {
      subscription.unsubscribe()
    }
  }

  /**
   * command: connect
   *
   * Function to connect to the hardware.
   * Check the connection status in ricConnector.setEventListener().
   * An essential function that must be implemented.
   * @returns The return value is meaningless.
   */
  connect = async (): Promise<boolean> => {
    await this.disconnect()
    let port: SerialPort | undefined

    try {
      port = await openSerialDevice()
      if (!port) return false
    } catch (ignore) {
      console.log(errmsg(ignore))
    }

    if (!port) {
      return false
    }

    this.updateConnectionState_('connecting')
    const device = new WebSerialDevice()
    this.device_ = device
    this.registerListeners_(device)
    device.open(port, { baudRate: 115200 })

    // 연결이 되면 onConnected_() 가 호출되고,
    // 연결이 실패하면 onDisconnected_() 가 호출됩니다
    return true
  }

  /**
   * 디바이스 콜백 - 연결됨
   */
  protected onConnected_ = async (device: WebSerialDevice) => {
    this.forceStop_ = false
    this.device_ = device
    this.updateConnectionState_('connected')
    this.rxLoop_()
    this.txLoop_()
  }

  /**
   * 디바이스 콜백 - 연결이 끊어짐
   */
  protected onDisconnected_ = async () => {
    this.forceStop_ = true
    this.disconnect()
  }

  /**
   * Observable's destroy trigger
   */
  private closeTrigger_ = (): Observable<any> => {
    return this.stopped$.pipe(filter(Boolean), take(1))
  }

  /**
   * 디바이스 콜백 - 디바이스로부터 데이터가 수신됨
   */
  protected handleRxPacket_ = (pkt: Uint8Array) => {
    if (this.forceStop_) return
    if (this.stopped$.value) {
      if (TRACE) console.log('stopped')
      return
    }

    // validate packet length
    if (pkt.length < 22) {
      console.info(`handleRxPacket_() invalid pkt.length: ${pkt.length} byte`)
      return
    }

    // validate packet start mark and end mark
    if (pkt[0] !== 2 || pkt[21] !== 3) {
      console.info(
        `handleRxPacket_() invalid packet start,end mark(buf[0]=${pkt[0]}, buf[21]=${pkt[21]}`,
      )
      return
    }

    const u16 = (index: number) => {
      const high = pkt[index + 1] & 0xff
      const low = pkt[index] & 0xff
      return (high << 8) | low
    }

    // copy the value of the packet to the sensor
    this.sensors.HUM = u16(5) / 100
    this.sensors.HEATER = u16(7) / 100
    this.sensors.TEMP = u16(9) / 100
    this.sensors.SOIL = u16(11)
    this.sensors.CDS = u16(13)
    this.sensors.SW1 = (pkt[16] & 0x01) == 0x01 ? 1 : 0
    this.sensors.SW2 = (pkt[16] & 0x02) == 0x02 ? 1 : 0
    this.sensors.SW3 = (pkt[16] & 0x04) == 0x04 ? 1 : 0
    if (TRACE) console.log(' accept:', JSON.stringify(this.sensors))
  }

  /**
   * 디바이스에 데이터를 전송합니다
   * Send values to the device
   */
  protected writeRaw_ = async (values: number[] | Uint8Array | string): Promise<void> => {
    const device = this.device_
    // 디바이스에 연결되지 않은 상태
    if (!device) {
      console.log('writeRaw_(): ignore, device not connected')
      return
    }

    // 디바이스 중지 중
    if (this.forceStop_) {
      console.log('writeRaw_(): ignore, stopping...')
      return
    }

    if (typeof values === 'string') {
      await device.write(new Uint8Array(values.split('').map(chr)))
    } else if (Array.isArray(values)) {
      await device.write(new Uint8Array(values))
    } else {
      await device.write(values)
    }
  }

  private rxLoop_ = () => {
    const device = this.device_
    if (!device) {
      console.log('rxLoop_(): device is not opened')
      return
    }

    const subscription = new Subscription()
    subscription.add(
      device
        .observeOpenedOrNot()
        .pipe(
          distinctUntilChanged(),
          switchMap((opened) => (opened ? device.observeRawData() : EMPTY)),
          SaeonSmartFarmParser.parse(),
          sampleTime(RX_INTERVAL), // 샘플링
          tap((dataBuffer) => {
            this.handleRxPacket_(dataBuffer)
          }),
          takeUntil(this.closeTrigger_()),
        )
        .subscribe(),
    )

    this.rxLoopDisposeFn_ = () => {
      subscription.unsubscribe()
    }
  }

  private txLoop_ = () => {
    console.log('txLoop_() start')
    const subscription = new Subscription()
    subscription.add(
      interval(TX_INTERVAL)
        .pipe(
          concatMap(() => from(this.writeOutput_())),
          takeUntil(this.closeTrigger_()),
        )
        .subscribe(),
    )
    this.txLoopDisposeFn_ = () => {
      subscription.unsubscribe()
    }
  }

  /**
   * update checksums
   */
  private updateCksum_(array: number[]) {
    let cksum = 0
    for (let i = 3; i < 21; i++) {
      cksum += array[i]
    }
    array[2] = cksum & 0xff
  }

  /**
   * Write an output object to a device
   */
  private writeOutput_ = async (): Promise<any> => {
    if (this.forceStop_) return
    if (this.stopped$.value) {
      if (TRACE) console.log('stopped')
      return
    }
    const output = this.output

    this.txBytes[5] = output.CONTROL
    this.txBytes[6] = output.LED1
    this.txBytes[7] = output.LED2
    this.txBytes[8] = output.LED3
    this.txBytes[9] = output.LED4
    this.txBytes[10] = output.LED5
    this.txBytes[11] = output.LED6
    this.txBytes[12] = output.DIS1
    this.txBytes[13] = output.DIS2
    this.txBytes[14] = output.DIS3
    this.txBytes[15] = output.DIS4
    this.txBytes[16] = output.DIS5
    this.txBytes[17] = output.DIS6
    this.txBytes[18] = output.DIS7
    this.txBytes[19] = output.DIS8
    this.txBytes[20] = output.DIS9
    this.updateCksum_(this.txBytes)
    // if (TRACE) console.log('TX', this.txBytes)
    await this.writeRaw_(this.txBytes).catch((err) => {
      console.info(`write fail: ${err.message}`)
    })
  }

  /**
   * command: disconnect
   *
   * Function to disconnect from the hardware.
   * An essential function that must be implemented.
   * @returns The return value is meaningless.
   */
  disconnect = async () => {
    this.forceStop_ = true
    if (this.disposeFn_) {
      this.disposeFn_()
      this.disposeFn_ = undefined
    }

    if (this.txLoopDisposeFn_) {
      this.txLoopDisposeFn_()
      this.txLoopDisposeFn_ = undefined
    }

    if (this.rxLoopDisposeFn_) {
      this.rxLoopDisposeFn_()
      this.rxLoopDisposeFn_ = undefined
    }

    if (this.device_) {
      await this.device_.close()
      this.device_ = undefined
    }

    // When changing the connection state, be sure to call updateConnectionState_()
    this.updateConnectionState_('disconnected')
  }
}
