import log from '@/log'
import { errmsg } from '@/util/misc'
import type {
  ConnectionState,
  HPetNotifiyEventDefinition,
  IHPetCommandRunner,
  IHPetContext,
  IParentSender,
} from '@ktaicoder/hw-pet'
import { HPetNotifyEventKeys } from '@ktaicoder/hw-pet'
import type EventEmitter from 'eventemitter3'
import { Subscription, map } from 'rxjs'
import { WebSerialDevice } from './WebSerialDevice'
import { openSerialDevice } from './command-util'

const chr = (str: string): number => str.charCodeAt(0)

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
      device.observeDeviceState().subscribe((state) => {
        if (state === 'opened') {
          this.onConnected_(device)
        } else if (state === 'closed') {
          this.onDisconnected_()
        }
      }),
    )

    // 디바이스로부터 데이터가 수신되면 콜백 호출
    subscription.add(
      device
        .observeRawData()
        .pipe(map((it) => it.dataBuffer))
        .subscribe(this.onDataFromDevice_),
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
    this.updateConnectionState_('connected')
  }

  /**
   * 디바이스 콜백 - 연결이 끊어짐
   */
  protected onDisconnected_ = async () => {
    this.forceStop_ = true
    this.updateConnectionState_('disconnected')
  }

  /**
   * 디바이스 콜백 - 디바이스로부터 데이터가 수신됨
   */
  protected onDataFromDevice_ = (dataBuffer: Uint8Array) => {
    console.log('onDataFromDevice_():', dataBuffer)
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

    if (this.device_) {
      await this.device_.close()
      this.device_ = undefined
    }

    // When changing the connection state, be sure to call updateConnectionState_()
    this.updateConnectionState_('disconnected')
  }
}
