import { type IHPetContext } from '@ktaicoder/hw-pet'
import { CommandRunnerBase } from './CommandRunnerBase'
import * as PingPongUtil from './pingpong-util'

/**
 * Inherits from the CommandRunnerBase class.
 * CommandRunnerBase handles the aspects related to the connection with hardware,
 * and this class handles the remaining commands that are sent to the hardware.
 */
export class CommandRunnerG2 extends CommandRunnerBase {
  private bleNusServiceUUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e'
  private bleNusCharRXUUID = '6e400002-b5a3-f393-e0a9-e50e24dcca9e'
  private bleNusCharTXUUID = '6e400003-b5a3-f393-e0a9-e50e24dcca9e'
  private rxCharacteristic: BluetoothRemoteGATTCharacteristic | undefined = undefined
  private txCharacteristic: BluetoothRemoteGATTCharacteristic | undefined = undefined

  queue: any
  isSending: boolean

  constructor(options: IHPetContext) {
    super(options)
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
  destroy = async () => {
    // empty
  }

  /**
   * Update the connection state variable,
   * emit an event if the connection state has changed,
   * and notify the parent frame (CODINY).
   * @param state - The connection state
   */
  // private updateConnectionState_ = (state: ConnectionState) => {
  //   if (state !== this.connectionState) {
  //     this.connectionState = state
  //     this.notifyEvents.emit(HPetNotifyEventKeys.connectionStateChanged, this.connectionState)

  //     // notify to parent frame (CODINY)
  //     this.toParent.notifyConnectionState(this.connectionState)

  // 연결은 connect()에서 작성해주세요
  //     // connect cube
  //     this.connectToCube()
  //   }
  // }

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
    console.log(`Receive ${String(PingPongUtil.byteToStringReceive(event))}`)
  }

  /** ____________________________________________________________________________________________________ */
  // Test 데이터 보내기
  test = async (): Promise<void> => {
    console.log('test')
  }

  sendTest = async (packet: string): Promise<void> => {
    this.enqueue(PingPongUtil.stringToByte(packet))
  }

  // 데이터를 큐에 추가하는 메소드
  enqueue(data) {
    console.log(`Send : + ${String(PingPongUtil.byteToString(data))}`)
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
    this.enqueue(PingPongUtil.setInstantTorque(cubeNum, torque))
  }
  /** ____________________________________________________________________________________________________ */

  connectToCube = async (): Promise<void> => {
    this.enqueue(PingPongUtil.getOrangeForSoundData())
  }

  // cubeNum : 큐브 총 갯수
  connectToCubeWithNum = async (cubeNum): Promise<void> => {
    this.enqueue(PingPongUtil.getSetMultiroleInAction(cubeNum))
  }

  // cubeNum : 큐브 총 갯수
  // cubeID : 큐브 순서 (0부터 시작)
  // speed : 속도 (100 ~ 1000)
  // step : 스텝 (0 ~ 1980)
  sendSingleStep = async (cubeNum, cubeID, speed, step): Promise<void> => {
    this.enqueue(PingPongUtil.makeSingleStep(cubeNum, cubeID, speed, step))
  }

  // cubeNum : 큐브 총 갯수
  // cubeID : 큐브 순서 (0부터 시작)
  // speed : 속도 (100 ~ 1000)
  sendContinuousStep = async (cubeNum, cubeID, speed): Promise<void> => {
    this.enqueue(PingPongUtil.makeContinuousStep(cubeNum, cubeID, speed))
  }

  sendAggregator = async (cubeNum, method, speed0, step0, speed1, step1): Promise<void> => {
    const innerData = new Array(2)

    switch (method) {
      case 0:
        innerData[0] = PingPongUtil.makeContinuousStep(cubeNum, 0, speed0)
        innerData[1] = PingPongUtil.makeContinuousStep(cubeNum, 1, speed1)
        break

      case 1:
        innerData[0] = PingPongUtil.makeSingleStep(cubeNum, 0, speed0, step0)
        innerData[1] = PingPongUtil.makeSingleStep(cubeNum, 1, speed1, step1)
        break

      case 3:
        break

      case 4:
        break

      default:
        break
    }

    this.enqueue(PingPongUtil.makeAggregateStep(cubeNum, innerData, method))
  }

  // Auto Car ____________________________________________________________________________________________________
  // speed (0 ~ 100)
  moveAutoCar = async (speed, distance): Promise<void> => {
    const innerAutoCarData = new Array(2)

    if (distance < 0) {
      innerAutoCarData[0] = PingPongUtil.makeSingleStep(
        2,
        0,
        PingPongUtil.changeSpeedToSps(speed),
        Math.round(Math.abs(distance) * 24.44444),
      )
      innerAutoCarData[1] = PingPongUtil.makeSingleStep(
        2,
        1,
        PingPongUtil.changeSpeedToSps(speed) * -1,
        Math.round(Math.abs(distance) * 24.44444),
      )
    } else {
      innerAutoCarData[0] = PingPongUtil.makeSingleStep(
        2,
        0,
        PingPongUtil.changeSpeedToSps(speed) * -1,
        Math.round(Math.abs(distance) * 24.44444),
      )
      innerAutoCarData[1] = PingPongUtil.makeSingleStep(
        2,
        1,
        PingPongUtil.changeSpeedToSps(speed),
        Math.round(Math.abs(distance) * 24.44444),
      )
    }

    this.enqueue(PingPongUtil.makeAggregateStep(2, innerAutoCarData, 1))
  }

  // speed (0 ~ 100)
  turnAutoCar = async (speed, angle): Promise<void> => {
    const innerAutoCarData = new Array(2)

    if (angle < 0) {
      innerAutoCarData[0] = PingPongUtil.makeSingleStep(
        2,
        0,
        PingPongUtil.changeSpeedToSps(speed),
        Math.round(Math.abs(angle) * 2.25),
      )
      innerAutoCarData[1] = PingPongUtil.makeSingleStep(
        2,
        1,
        PingPongUtil.changeSpeedToSps(speed),
        Math.round(Math.abs(angle) * 2.25),
      )
    } else {
      innerAutoCarData[0] = PingPongUtil.makeSingleStep(
        2,
        0,
        PingPongUtil.changeSpeedToSps(speed) * -1,
        Math.round(Math.abs(angle) * 2.25),
      )
      innerAutoCarData[1] = PingPongUtil.makeSingleStep(
        2,
        1,
        PingPongUtil.changeSpeedToSps(speed) * -1,
        Math.round(Math.abs(angle) * 2.25),
      )
    }

    this.enqueue(PingPongUtil.makeAggregateStep(2, innerAutoCarData, 1))
  }

  // Rolling Car ____________________________________________________________________________________________________
  // distance 1 = 큐브 1면 90도 회전
  moveRollingCar = async (speed, distance): Promise<void> => {
    const innerAutoCarData = new Array(2)

    if (distance < 0) {
      innerAutoCarData[0] = PingPongUtil.makeSingleStep(
        2,
        0,
        PingPongUtil.changeSpeedToSps(speed),
        495 * Math.abs(distance),
      )
      innerAutoCarData[1] = PingPongUtil.makeSingleStep(2, 1, 0, 0)
    } else {
      innerAutoCarData[0] = PingPongUtil.makeSingleStep(
        2,
        0,
        PingPongUtil.changeSpeedToSps(speed) * -1,
        495 * Math.abs(distance),
      )
      innerAutoCarData[1] = PingPongUtil.makeSingleStep(2, 1, 0, 0)
    }

    this.enqueue(PingPongUtil.makeAggregateStep(2, innerAutoCarData, 1))
  }

  // speed (0 ~ 100)
  turnRollingCar = async (speed, angle): Promise<void> => {
    const innerAutoCarData = new Array(2)

    if (angle < 0) {
      innerAutoCarData[0] = PingPongUtil.makeSingleStep(2, 0, 0, 0)
      innerAutoCarData[1] = PingPongUtil.makeSingleStep(
        2,
        1,
        PingPongUtil.changeSpeedToSps(speed),
        Math.round((Math.abs(angle) / 360) * 1980 * 1.35),
      )
    } else {
      innerAutoCarData[0] = PingPongUtil.makeSingleStep(2, 0, 0, 0)
      innerAutoCarData[1] = PingPongUtil.makeSingleStep(
        2,
        1,
        PingPongUtil.changeSpeedToSps(speed) * -1,
        Math.round((Math.abs(angle) / 360) * 1980 * 1.35),
      )
    }

    this.enqueue(PingPongUtil.makeAggregateStep(2, innerAutoCarData, 1))
  }

  // Worm Bot ____________________________________________________________________________________________________

  sendSchedule = async (): Promise<void> => {
    this.sendTest(
      'ff ff ff aa 20 00 cd 02 43 02 03 00 00 ff ff ff 00 00 00 ca 01 1b 02 03 00 01 c5 17 fc a5 00 f8 03 5b 00 f8 fc 7c 00 f8 00 00 02 58 03 5b 00 f8 fc 7c 00 f8 00 00 02 58 03 5b 00 f8 00 00 02 58 00 00 03 20 fc a5 00 f8 00 00 02 58 03 84 00 f8 fc a5 00 f8 00 00 02 58 03 84 00 f8 fc a5 00 f8 00 00 02 58 03 5b 00 f8 00 00 03 20 fc 41 01 ef 03 97 01 ef 03 97 01 ef 01 1a 00 6e fc 48 02 5d 00 00 02 26 02 ff 00 a5 fd 5c 00 a5 00 00 03 20 fc f2 00 dc 02 b3 00 dc 01 1a 00 6e 03 3c 01 4a fc 80 01 b8 fc 23 01 ef 03 dd 01 ef 00 00 02 bc 00 00 03 20 fc 41 01 ef 03 97 01 ef 00 00 03 20 fc 23 01 ef 03 dd 01 ef 00 00 02 bc 00 00 03 20 02 b9 00 f8 fc 8d 00 8a 03 73 00 8a fc 8d 00 8a 03 73 00 8a fc 7d 01 f0 03 73 00 8a fc 8d 00 8a 03 73 00 8a fc 8d 00 8a fc 7e 00 f7 03 82 01 ef fc 7d 00 f8 03 ab 01 f0 fc 55 01 f0 03 ab 01 f0 fc 55 00 f8 fc 23 01 ef 03 dd 01 ef 00 00 02 bc 00 00 03 20 00 00 03 e8 ff ff ff 01 00 00 ca 01 1b 02 03 00 01 48 bf fc a5 00 f8 00 00 02 58 03 84 00 f8 fc a5 00 f8 00 00 02 58 03 84 00 f8 fc a5 00 f8 00 00 02 58 03 5b 00 f8 00 00 03 20 fc a5 00 f8 03 5b 00 f8 fc 7c 00 f8 00 00 02 58 03 5b 00 f8 fc 7c 00 f8 00 00 02 58 03 5b 00 f8 00 00 02 58 00 00 03 20 fc f2 00 dc 02 b3 00 dc 01 1a 00 6e 03 3c 01 4a fc 80 01 b8 fc 23 01 ef 03 dd 01 ef 00 00 02 bc 00 00 03 20 fc 41 01 ef 03 97 01 ef 03 97 01 ef 01 1a 00 6e fc 48 02 5d 00 00 02 26 02 ff 00 a5 fd 5c 00 a5 00 00 03 20 fc f2 00 dc 02 b3 00 dc 00 00 03 20 00 00 02 26 02 ff 00 a5 fd 5c 00 a5 00 00 03 20 02 b9 00 f8 fc 8d 00 8a 03 73 00 8a fc 8d 00 8a 03 73 00 8a fc 7d 01 f0 03 73 00 8a fc 8d 00 8a 03 73 00 8a fc 8d 00 8a fd 20 00 89 03 49 01 81 03 83 00 f8 fc 55 01 f0 03 ab 01 f0 fc 55 01 f0 03 ab 00 f8 00 00 02 26 02 ff 00 a5 fd 5c 00 a5 00 00 03 20 00 00 03 e8',
    )
  }

  sendStart = async (): Promise<void> => {
    this.sendTest('ff ff ff ff 00 00 c0 00 0a 02')
  }

  sendFront = async (): Promise<void> => {
    this.sendTest('ff ff ff ff 00 00 cb 00 14 02 04 04 01 00 00 00 00 00 09 01')
  }

  sendBack = async (): Promise<void> => {
    this.sendTest('ff ff ff ff 00 00 cb 00 14 02 04 04 01 00 00 00 0a 00 13 01')
  }

  sendDumbFront = async (): Promise<void> => {
    this.sendTest('ff ff ff ff 00 00 cb 00 14 02 04 04 01 00 00 00 14 00 1c 01')
  }

  sendDumbBack = async (): Promise<void> => {
    this.sendTest('ff ff ff ff 00 00 cb 00 14 02 04 04 01 00 00 00 1d 00 25 01')
  }

  sendDance = async (): Promise<void> => {
    this.sendTest('ff ff ff ff 00 00 cb 00 14 02 04 04 01 00 00 00 2d 00 41 01')
  }
}
