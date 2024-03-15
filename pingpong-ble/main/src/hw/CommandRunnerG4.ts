import { type IHPetContext } from '@ktaicoder/hw-pet'
import { sleepAsync } from '@repo/ui'
import { CommandRunnerBase } from './CommandRunnerBase'
import * as PingPongUtil from './pingpong-util'

/**
 * Inherits from the CommandRunnerBase class.
 * CommandRunnerBase handles the aspects related to the connection with hardware,
 * and this class handles the remaining commands that are sent to the hardware.
 */
export class CommandRunnerG4 extends CommandRunnerBase {
  private bleNusServiceUUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e'
  private bleNusCharRXUUID = '6e400002-b5a3-f393-e0a9-e50e24dcca9e'
  private bleNusCharTXUUID = '6e400003-b5a3-f393-e0a9-e50e24dcca9e'
  private rxCharacteristic: BluetoothRemoteGATTCharacteristic | undefined = undefined
  private txCharacteristic: BluetoothRemoteGATTCharacteristic | undefined = undefined

  queue: any
  isSending: boolean

  groupNumber : string

  constructor(options: IHPetContext) {
    super(options)
    this.queue = []
    this.isSending = false

    this.groupNumber = '0'
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
    console.log('connect', this.groupNumber)
    const device = await this.scan()
    if (!device) {
      console.log('not device')
      return false
    }
    const server = await device.gatt?.connect()
    const service = await server.getPrimaryService(this.bleNusServiceUUID)

    this.rxCharacteristic = await service?.getCharacteristic(this.bleNusCharRXUUID)
    this.txCharacteristic = await service?.getCharacteristic(this.bleNusCharTXUUID)
    await this.txCharacteristic?.startNotifications()
    this.txCharacteristic?.addEventListener('characteristicvaluechanged', this.receivedBytes)
    this.updateConnectionState_('connected')

    await this.connectToCubeWithNum(4, this.groupNumber)

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
    this.enqueue(PingPongUtil.rebootMultiroleAggregator())

    // When changing the connection state, be sure to call updateConnectionState_()
    this.updateConnectionState_('disconnected')
  }

  scan = async (): Promise<BluetoothDevice | null> => {
    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ namePrefix: 'PINGPONG' }],
        optionalServices: [this.bleNusServiceUUID],
      })
      console.log('블루투스 디바이스:', device);
      return device
    } catch (e) {
      return null
    }
  }

  // scan = async (): Promise<BluetoothDevice | null> => {
  //   try {
  //     if (this.groupNumber === '00') {
  //       const device = await navigator.bluetooth.requestDevice({
  //         filters: [{ namePrefix: 'PINGPONG' }],
  //         optionalServices: [this.bleNusServiceUUID],
  //       })
  //       console.log('블루투스 디바이스:', device);
  //       return device
  //     } else {
  //       console.log(`test = PINGPONG.${this.groupNumber}`)
  //       const device = await navigator.bluetooth.requestDevice({
  //         // `name` 필터를 사용하여 정확한 이름으로 검색
  //         filters: [{ name: `PINGPONG.${this.groupNumber}` }],
  //         optionalServices: [this.bleNusServiceUUID],
  //       });
  //       return device;
  //     }
  //   } catch (e) {
  //     return null
  //   }
  // }

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

  setInstantTorque = async (cubeNum, torque): Promise<void> => {
    this.enqueue(PingPongUtil.setInstantTorque(cubeNum, torque))
  }
  /** ____________________________________________________________________________________________________ */

  // cubeNum : 큐브 총 갯수
  connectToCubeWithNum = async (cubeNum: number, groupID: string): Promise<void> => {
    this.enqueue(PingPongUtil.getSetMultiroleInAction(cubeNum, groupID))
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        console.log('connectToCubeWithNum 4 done')
        resolve()
      }, 1000)
    })
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

  sendAggregator = async (
    cubeNum,
    method,
    speed0,
    step0,
    speed1,
    step1,
    speed2,
    step2,
    speed3,
    step3,
  ): Promise<void> => {
    const innerData = new Array(2)

    switch (method) {
      case 0:
        innerData[0] = PingPongUtil.makeContinuousStep(cubeNum, 0, speed0)
        innerData[1] = PingPongUtil.makeContinuousStep(cubeNum, 1, speed1)
        innerData[2] = PingPongUtil.makeContinuousStep(cubeNum, 2, speed2)
        innerData[3] = PingPongUtil.makeContinuousStep(cubeNum, 3, speed3)
        break

      case 1:
        innerData[0] = PingPongUtil.makeSingleStep(cubeNum, 0, speed0, step0)
        innerData[1] = PingPongUtil.makeSingleStep(cubeNum, 1, speed1, step1)
        innerData[2] = PingPongUtil.makeSingleStep(cubeNum, 2, speed2, step2)
        innerData[3] = PingPongUtil.makeSingleStep(cubeNum, 3, speed3, step3)
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

  // Crawling Bot ____________________________________________________________________________________________________

  sendSchedule = async (): Promise<void> => {
    this.sendTest(
      'ff ff ff aa 40 00 cd 05 19 02 03 00 00 ff ff ff 00 00 00 ca 01 43 02 03 00 01 23 3d 00 00 03 20 00 00 03 20 00 00 03 20 03 0a 00 f8 fc f6 00 f8 00 00 03 20 03 0a 00 f8 fc f6 00 f8 00 00 03 20 fc f7 01 ef fd 52 00 c1 00 00 07 d0 01 2f 00 5e 01 57 00 63 01 df 00 c1 00 00 07 d0 fd 52 00 c1 fd 52 00 c1 fc ae 03 1d 00 00 02 ee 00 00 02 ee fe 8b 00 a5 fc a6 03 39 00 00 03 20 03 09 01 ef 00 00 03 20 fc f7 01 ef 02 ae 00 c1 03 52 03 1d 00 00 02 ee 00 00 02 ee 01 75 00 a5 03 5a 03 39 00 00 03 20 02 ae 00 c1 00 00 07 d0 fe d1 00 5e fe a9 00 63 fe 21 00 c1 00 00 07 d0 02 ae 00 c1 03 09 01 ef 00 00 03 20 fc f6 00 f8 03 e8 07 bc 03 0a 00 f8 00 00 03 20 fc f6 00 f8 fc 18 07 bc 03 0a 00 f8 00 00 03 20 fc f7 01 ef 02 62 00 37 fd 9e 00 37 02 62 00 37 fd 9e 00 37 03 09 01 ef 00 00 03 20 fc f7 01 ef 00 00 01 0e 00 00 01 0e 00 00 01 0e 00 00 01 0e 03 09 01 ef 00 00 03 20 fc f7 01 ef fd ba 00 c1 00 00 07 d0 01 2f 00 5e 01 57 00 63 00 00 01 f4 fe 21 00 c1 00 00 07 d0 02 ae 00 c1 03 09 01 ef 00 00 03 20 00 00 03 e8 ff ff ff 01 00 00 ca 01 43 02 03 00 01 f5 14 00 00 03 20 00 00 03 20 00 00 03 20 03 0a 00 f8 fc f6 00 f8 00 00 03 20 03 0a 00 f8 fc f6 00 f8 00 00 03 20 fc f7 01 ef fd 52 00 c1 00 00 07 d0 03 71 01 56 03 74 01 5a 03 5a 01 ef 00 00 07 d0 00 00 03 20 fd 52 00 c1 fc d7 02 af 02 29 00 89 03 1e 00 f8 01 75 00 a5 fd 48 01 ef fd 98 00 a5 03 09 01 ef 00 00 03 20 fc f7 01 ef 02 ae 00 c1 03 29 02 af fd d7 00 89 fc e2 00 f8 fe 8b 00 a5 02 b8 01 ef 02 68 00 a5 02 ae 00 c1 00 00 07 d0 fc 8f 01 56 fc 8c 01 5a fc a6 01 ef 00 00 07 d0 00 00 03 20 03 09 01 ef 00 00 03 20 fc f6 00 f8 00 00 07 bc 03 0a 00 f8 00 00 03 20 fc f6 00 f8 00 00 07 bc 03 0a 00 f8 00 00 03 20 fc f7 01 ef 03 a9 00 a5 fc 57 00 a5 03 a9 00 a5 fc 57 00 a5 03 09 01 ef 00 00 03 20 fc f7 01 ef 00 00 01 0e 00 00 01 0e 00 00 01 0e 00 00 01 0e 03 09 01 ef 00 00 03 20 fc f7 01 ef fd ba 00 c1 00 00 07 d0 03 71 01 56 03 74 01 5a 00 00 01 f4 fc a6 01 ef 00 00 07 d0 00 00 03 20 03 09 01 ef 00 00 03 20 00 00 03 e8 ff ff ff 02 00 00 ca 01 43 02 03 00 01 a3 c5 fc f6 00 f8 03 0a 00 f8 00 00 03 20 00 00 03 20 00 00 03 20 00 00 03 20 fc f6 00 f8 03 0a 00 f8 00 00 03 20 03 09 01 ef fd 52 00 c1 fc d7 02 af 02 29 00 89 03 1e 00 f8 01 75 00 a5 fd 48 01 ef fd 98 00 a5 fd 52 00 c1 00 00 07 d0 03 71 01 56 03 74 01 5a 03 5a 01 ef 00 00 07 d0 00 00 03 20 fc f7 01 ef 00 00 03 20 03 09 01 ef 02 ae 00 c1 00 00 07 d0 fc 8f 01 56 fc 8c 01 5a fc a6 01 ef 00 00 07 d0 00 00 03 20 02 ae 00 c1 03 29 02 af fd d7 00 89 fc e2 00 f8 fe 8b 00 a5 02 b8 01 ef 02 68 00 a5 fc f7 01 ef 00 00 03 20 03 0a 00 f8 00 00 07 bc fc f6 00 f8 00 00 03 20 03 0a 00 f8 00 00 07 bc fc f6 00 f8 00 00 03 20 03 09 01 ef 00 00 01 0e 00 00 01 0e 00 00 01 0e 00 00 01 0e fc f7 01 ef 00 00 03 20 03 09 01 ef fc 57 00 a5 03 a9 00 a5 fc 57 00 a5 03 a9 00 a5 fc f7 01 ef 00 00 03 20 03 09 01 ef fd ba 00 c1 fc d7 02 af 02 29 00 89 03 1e 00 f8 00 00 01 f4 fe 8b 00 a5 02 b8 01 ef 02 68 00 a5 fc f7 01 ef 00 00 03 20 00 00 03 e8 ff ff ff 03 00 00 ca 01 43 02 03 00 01 e3 51 fc f6 00 f8 03 0a 00 f8 00 00 03 20 00 00 03 20 00 00 03 20 00 00 03 20 fc f6 00 f8 03 0a 00 f8 00 00 03 20 03 09 01 ef fd 52 00 c1 fc ae 03 1d 00 00 02 ee 00 00 02 ee fe 8b 00 a5 fc a6 03 39 00 00 03 20 fd 52 00 c1 00 00 07 d0 01 2f 00 5e 01 57 00 63 01 df 00 c1 00 00 07 d0 fd 52 00 c1 fc f7 01 ef 00 00 03 20 03 09 01 ef 02 ae 00 c1 00 00 07 d0 fe d1 00 5e fe a9 00 63 fe 21 00 c1 00 00 07 d0 02 ae 00 c1 02 ae 00 c1 03 52 03 1d 00 00 02 ee 00 00 02 ee 01 75 00 a5 03 5a 03 39 00 00 03 20 fc f7 01 ef 00 00 03 20 03 0a 00 f8 03 e8 07 bc fc f6 00 f8 00 00 03 20 03 0a 00 f8 fc 18 07 bc fc f6 00 f8 00 00 03 20 03 09 01 ef 00 00 01 0e 00 00 01 0e 00 00 01 0e 00 00 01 0e fc f7 01 ef 00 00 03 20 03 09 01 ef fd 9e 00 37 02 62 00 37 fd 9e 00 37 02 62 00 37 fc f7 01 ef 00 00 03 20 03 09 01 ef fd ba 00 c1 fc ae 03 1d 00 00 02 ee 00 00 02 ee 00 00 01 f4 01 75 00 a5 03 5a 03 39 00 00 03 20 fc f7 01 ef 00 00 03 20 00 00 03 e8',
    )
  }

  sendStart = async (): Promise<void> => {
    this.sendTest('ff ff ff ff 00 00 c0 00 0a 02')
  }

  sendFront = async (): Promise<void> => {
    this.sendTest('ff ff ff ff 00 00 cb 00 14 02 04 04 01 00 00 00 2b 00 2e 01')
  }

  sendBack = async (): Promise<void> => {
    this.sendTest('ff ff ff ff 00 00 cb 00 14 02 04 04 01 00 00 00 2f 00 32 01')
  }

  sendStepLeft = async (): Promise<void> => {
    this.sendTest('ff ff ff ff 00 00 cb 00 14 02 04 04 01 00 00 00 3a 00 40 01')
  }

  sendStepRight = async (): Promise<void> => {
    this.sendTest('ff ff ff ff 00 00 cb 00 14 02 04 04 01 00 00 00 33 00 39 01')
  }

  sendLeftHand = async (): Promise<void> => {
    this.sendTest('ff ff ff ff 00 00 cb 00 14 02 04 04 01 00 00 00 03 00 05 01')
  }

  sendRightHand = async (): Promise<void> => {
    this.sendTest('ff ff ff ff 00 00 cb 00 14 02 04 04 01 00 00 00 00 00 02 01')
  }

  sendAllHand = async (): Promise<void> => {
    this.sendTest('ff ff ff ff 00 00 cb 00 14 02 04 04 01 00 00 00 06 00 08 01')
  }

  sendDumbFront = async (): Promise<void> => {
    this.sendTest('ff ff ff ff 00 00 cb 00 14 02 04 04 01 00 00 00 09 00 19 01')
  }

  sendDumbBack = async (): Promise<void> => {
    this.sendTest('ff ff ff ff 00 00 cb 00 14 02 04 04 01 00 00 00 1a 00 2a 01')
  }

  sendStand = async (): Promise<void> => {
    this.sendTest('ff ff ff ff 00 00 cb 00 14 02 04 04 01 00 00 00 41 00 4b 01')
  }
}
