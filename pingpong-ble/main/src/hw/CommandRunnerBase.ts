import log from '@/log'
import type {
  ConnectionState,
  HPetNotifiyEventDefinition,
  IHPetCommandRunner,
  IHPetContext,
  IParentSender,
} from '@ktaicoder/hw-pet'
import { HPetNotifyEventKeys } from '@ktaicoder/hw-pet'
import type { EventEmitter } from 'eventemitter3'

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
   * iframe의 ui와 상호작용할 수 있는 이벤트, 필요한 경우에만 사용
   */
    private uiEvents: EventEmitter<string | symbol>

  constructor(options: IHPetContext) {
    const { hwId, toParent, commandEvents, notifyEvents, uiEvents } = options

    this.hwId = hwId
    this.toParent = toParent
    this.notifyEvents = notifyEvents
    this.uiEvents = uiEvents
    // commandEvents: 부모 프레임에서 전달되는 명령의 이벤트들
    // notifyEvents: 부모 프레임에 전달하는 연결 상태등의 notification 이벤트들
  }

  /**
   * Lifecycle function, Automatically called.
   * An essential function that must be implemented.
   * Called once before communicating with parent frame (CODINY).
   * Initialization tasks, such as registering event listeners, can be performed here.
   */
  init = async (): Promise<void> => {
    log.debug('CommandRunnerBase.init()')
  }

  /**
   * Lifecycle function, Automatically called.
   * An essential function that must be implemented.
   * Called once after the connection with the hardware is terminated.
   * Cleanup tasks, such as unregistering event listeners, can be performed here.
   */
  destroy = async () => {
    log.debug('CommandRunnerBase.destroy()')
  }

  /**
   * Update the connection state variable,
   * emit an event if the connection state has changed,
   * and notify the parent frame (CODINY).
   * @param state - The connection state
   */
  protected updateConnectionState_ = (state: ConnectionState) => {
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

  /**
   * command: disconnect
   *
   * Function to disconnect from the hardware.
   * An essential function that must be implemented.
   * @returns The return value is meaningless.
   */
  disconnect = async () => {
    // await this.rxCharacteristic?.writeValue(this.rebootMultiroleAggregator(""))

    // When changing the connection state, be sure to call updateConnectionState_()
    this.updateConnectionState_('disconnected')
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
    // await this.disconnect()
    this.updateConnectionState_('connected')
    return true
  }
}
