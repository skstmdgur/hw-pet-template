import { HPetEventKeys } from '@ktaicoder/hw-pet'
import type {
  HPetEventDefinition,
  ConnectionState,
  IHPetCommandRunner,
  IHPetContext,
  IParentSender,
} from '@ktaicoder/hw-pet'
import type EventEmitter from 'eventemitter3'
import { sleepAsync } from '@/util/misc'
import { PingPongUtill } from './pingpong-util'

/**
 * Inherits from the CommandRunnerBase class.
 * CommandRunnerBase handles the aspects related to the connection with hardware,
 * and this class handles the remaining commands that are sent to the hardware.
 */
export class CommandRunner implements IHPetCommandRunner {
  private connectionState: ConnectionState = 'disconnected'
  private hwId: string
  private toParent: IParentSender
  private events: EventEmitter<HPetEventDefinition>
  private bleNusServiceUUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e'
  private bleNusCharRXUUID = '6e400002-b5a3-f393-e0a9-e50e24dcca9e'
  private bleNusCharTXUUID = '6e400003-b5a3-f393-e0a9-e50e24dcca9e'
  private rxCharacteristic: BluetoothRemoteGATTCharacteristic | undefined = undefined
  private txCharacteristic: BluetoothRemoteGATTCharacteristic | undefined = undefined

  protected pingpongutill = new PingPongUtill()

  queue: any
  isSending: boolean

  constructor(options: IHPetContext) {
    this.hwId = options.hwId
    this.toParent = options.toParent
    this.events = options.events

    this.queue = []
    this.isSending = false
  }

  /**
   * Lifecycle function, Automatically called.
   * An essential function that must be implemented.
   * Called once before communicating with parent frame (CODINY).
   * Initialization tasks, such as registering event listeners, can be performed here.
   */
  init = async (): Promise<void> => {
    // 변수 및 배열 초기화
  }

  /**
   * Lifecycle function, Automatically called.
   * An essential function that must be implemented.
   * Called once after the connection with the hardware is terminated.
   * Cleanup tasks, such as unregistering event listeners, can be performed here.
   */
  destroy = async () => {}

  /**
   * Update the connection state variable,
   * emit an event if the connection state has changed,
   * and notify the parent frame (CODINY).
   * @param state - The connection state
   */
  private updateConnectionState_ = (state: ConnectionState) => {
    if (state !== this.connectionState) {
      this.connectionState = state
      this.events.emit(HPetEventKeys.connectionStateChanged, this.connectionState)

      // notify to parent frame (CODINY)
      this.toParent.notifyConnectionState(this.connectionState)

      // connect cube
      this.connectToCube()
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
   * command: connect
   *
   * Function to connect to the hardware.
   * Check the connection status in ricConnector.setEventListener().
   * An essential function that must be implemented.
   * @returns The return value is meaningless.
   */
  connect = async (): Promise<boolean> => {
    console.log('connect')
    const device = await this.scan()
    if (!device) {
      return false
    }
    const server = await device.gatt?.connect()
    const service = await server.getPrimaryService(this.bleNusServiceUUID)

    this.rxCharacteristic = await service?.getCharacteristic(this.bleNusCharRXUUID)
    this.txCharacteristic = await service?.getCharacteristic(this.bleNusCharTXUUID)
    await this.txCharacteristic?.startNotifications()
    this.txCharacteristic?.addEventListener('characteristicvaluechanged', this.receivedBytes)
    this.updateConnectionState_('connected')

    return true
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

  scan = async (): Promise<BluetoothDevice | null> => {
    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ namePrefix: 'PINGPONG' }],
        optionalServices: [this.bleNusServiceUUID],
      })
      return device
    } catch (e) {
      return null
    }
  }

  // 받는 데이터
  receivedBytes = (event: any): void => {
    console.log(`Receive ${String(this.pingpongutill.byteToString(event.target.value.buffer))}`)
  }

  receiveEventByteToString = (event: any): String => {
    let hexStr = ''
    const hexSpace = ' '

    for (let i = 0; i < event.target.value.byteLength; i++) {
      // 각 바이트를 16진수로 변환
      const hex = event.target.value.getUint8(i).toString(16).padStart(2, '0')
      hexStr += hex + hexSpace
    }

    // 공백 제거
    hexStr.trim()
    return hexStr
  }

  /** ____________________________________________________________________________________________________ */
  // Test 데이터 보내기
  test = async (): Promise<void> => {
    console.log('test')
  }

  sendTest = async (packet: string): Promise<void> => {
    this.enqueue(this.pingpongutill.stringToByte(packet))
  }

  // 데이터를 큐에 추가하는 메소드
  enqueue(data) {
    console.log(`Send : + ${String(this.pingpongutill.byteToString(data))}`)
    // 데이터를 20바이트씩 분할하여 큐에 추가
    for (let i = 0; i < data.length; i += 20) {
      const chunk = data.slice(i, i + 20)
      this.queue.push(chunk)
    }
    this.processQueue()
  }

  // 큐를 처리하는 메소드
  async processQueue() {
    if (this.isSending || this.queue.length === 0) {
      return
    }

    this.isSending = true

    while (this.queue.length > 0) {
      const dataChunk = this.queue.shift()
      await this.sendData(dataChunk)
    }

    this.isSending = false
  }

  async sendData(packet: Uint8Array) {
    this.rxCharacteristic?.writeValue(packet)
    await new Promise((resolve) => {
      setTimeout(resolve, 500)
    })
  }

  rebootMultiroleAggregator = (event: any): Uint8Array => {
    const hexArray = 'ff ff ff ff 00 00 a8 00 0a 01'.split(' ')
    const byteArray = hexArray.map((hex) => parseInt(hex, 16))

    const buffer = new Uint8Array(byteArray)
    return buffer
  }

  setInstantTorque = async (cubeNum, torque): Promise<void> => {
    this.enqueue(this.pingpongutill.setInstantTorque(cubeNum, torque))
  }
  /** ____________________________________________________________________________________________________ */

  connectToCube = async (): Promise<void> => {
    this.enqueue(this.pingpongutill.getOrangeForSoundData())
  }

  // cubeNum : 큐브 총 갯수
  connectToCubeWithNum = async (cubeNum): Promise<void> => {
    this.enqueue(this.pingpongutill.getSetMultiroleInAction(cubeNum))
  }

  // cubeNum : 큐브 총 갯수
  // cubeID : 큐브 순서 (0부터 시작)
  // speed : 속도 (100 ~ 1000)
  // step : 스텝 (0 ~ 1980)
  sendSingleStep = async (cubeNum, cubeID, speed, step): Promise<void> => {
    this.enqueue(this.pingpongutill.makeSingleStep(cubeNum, cubeID, speed, step))
  }

  // cubeNum : 큐브 총 갯수
  // cubeID : 큐브 순서 (0부터 시작)
  // speed : 속도 (100 ~ 1000)
  sendContinuousStep = async (cubeNum, cubeID, speed): Promise<void> => {
    this.enqueue(this.pingpongutill.makeContinuousStep(cubeNum, cubeID, speed))
  }
}
