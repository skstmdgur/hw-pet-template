import { type IHPetContext } from '@ktaicoder/hw-pet'
import { sleepAsync } from '@repo/ui'
import { CommandRunnerBase } from './CommandRunnerBase'
import * as PingPongUtil from './pingpong-util'

/**
 * Inherits from the CommandRunnerBase class.
 * CommandRunnerBase handles the aspects related to the connection with hardware,
 * and this class handles the remaining commands that are sent to the hardware.
 */
export class CommandRunnerG3 extends CommandRunnerBase {
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

    await this.connectToCubeWithNum(3, this.groupNumber)

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
        console.log('connectToCubeWithNum 3 done')
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
  ): Promise<void> => {
    const innerData = new Array(2)

    switch (method) {
      case 0:
        innerData[0] = PingPongUtil.makeContinuousStep(cubeNum, 0, speed0)
        innerData[1] = PingPongUtil.makeContinuousStep(cubeNum, 1, speed1)
        innerData[2] = PingPongUtil.makeContinuousStep(cubeNum, 2, speed2)
        break

      case 1:
        innerData[0] = PingPongUtil.makeSingleStep(cubeNum, 0, speed0, step0)
        innerData[1] = PingPongUtil.makeSingleStep(cubeNum, 1, speed1, step1)
        innerData[2] = PingPongUtil.makeSingleStep(cubeNum, 2, speed2, step2)
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

  // Matrix
  sendMatrixPicture = async (cubeNum, picture): Promise<void> => {}

  fishMatrixPicture = async (cubeNum, picture): Promise<void> => {
    this.enqueue(PingPongUtil.stringToByte('ff ff ff 02 00 e2 a2 00 12 70 00 00 00 00 01 01 00 00'))
    sleepAsync(50)
    this.enqueue(PingPongUtil.stringToByte('ff ff ff 02 00 e2 a2 00 12 70 00 00 00 01 03 03 00 00'))
    sleepAsync(50)
    this.enqueue(PingPongUtil.stringToByte('ff ff ff 02 00 e2 a2 00 12 70 00 00 01 03 06 07 00 00'))
    sleepAsync(50)
    this.enqueue(PingPongUtil.stringToByte('ff ff ff 02 00 e2 a2 00 12 70 00 01 03 07 0d 0f 01 00'))
    sleepAsync(50)
    this.enqueue(PingPongUtil.stringToByte('ff ff ff 02 00 e2 a2 00 12 70 00 02 07 0f 1b 1f 03 01'))
    sleepAsync(50)
    this.enqueue(PingPongUtil.stringToByte('ff ff ff 02 00 e2 a2 00 12 70 00 04 0f 1f 37 3f 06 02'))
    sleepAsync(50)
    this.enqueue(PingPongUtil.stringToByte('ff ff ff 02 00 e2 a2 00 12 70 00 08 1e 3f 6f 7e 0c 04'))
    sleepAsync(50)
    this.enqueue(PingPongUtil.stringToByte('ff ff ff 02 00 e2 a2 00 12 70 00 10 3d 7f df fd 18 08'))
    sleepAsync(50)

    this.enqueue(PingPongUtil.stringToByte('ff ff ff 02 00 e2 a2 00 12 70 00 20 7a fe be fa 30 10'))
    sleepAsync(50)
    this.enqueue(PingPongUtil.stringToByte('ff ff ff 01 00 e2 a2 00 12 70 00 00 00 00 01 01 00 00'))
    sleepAsync(10)
    this.enqueue(PingPongUtil.stringToByte('ff ff ff 02 00 e2 a2 00 12 70 00 40 f4 fc 7c f4 60 20'))
    sleepAsync(50)
    this.enqueue(PingPongUtil.stringToByte('ff ff ff 01 00 e2 a2 00 12 70 00 00 00 01 03 03 00 00'))
    sleepAsync(10)
    this.enqueue(PingPongUtil.stringToByte('ff ff ff 02 00 e2 a2 00 12 70 00 80 e8 f8 f8 e8 c0 40'))
    sleepAsync(50)
    this.enqueue(PingPongUtil.stringToByte('ff ff ff 01 00 e2 a2 00 12 70 00 00 01 03 06 07 00 00'))
    sleepAsync(10)
    this.enqueue(PingPongUtil.stringToByte('ff ff ff 02 00 e2 a2 00 12 70 00 00 d0 f0 f0 d0 80 80'))
    sleepAsync(50)
    this.enqueue(PingPongUtil.stringToByte('ff ff ff 01 00 e2 a2 00 12 70 00 01 03 07 0d 0f 01 00'))
    sleepAsync(10)
    this.enqueue(PingPongUtil.stringToByte('ff ff ff 02 00 e2 a2 00 12 70 00 00 40 c0 c0 40 00 00'))
    sleepAsync(50)
    this.enqueue(PingPongUtil.stringToByte('ff ff ff 01 00 e2 a2 00 12 70 00 02 07 0f 1b 1f 03 01'))
    sleepAsync(10)
    this.enqueue(PingPongUtil.stringToByte('ff ff ff 02 00 e2 a2 00 12 70 00 00 80 80 80 80 00 00'))
    sleepAsync(50)
    this.enqueue(PingPongUtil.stringToByte('ff ff ff 01 00 e2 a2 00 12 70 00 04 0f 1f 37 3f 06 02'))
    sleepAsync(10)
    this.enqueue(PingPongUtil.stringToByte('ff ff ff 02 00 e2 a2 00 12 70 00 00 00 00 00 00 00 00'))
    sleepAsync(50)
    this.enqueue(PingPongUtil.stringToByte('ff ff ff 01 00 e2 a2 00 12 70 00 08 1e 3f 6f 7e 0c 04'))
    sleepAsync(10)

    this.enqueue(PingPongUtil.stringToByte('ff ff ff 01 00 e2 a2 00 12 70 00 10 3d 7f df fd 18 08'))
    sleepAsync(10)
  }

  ktaictMatrixPicture = async (num1, num2, num3): Promise<void> => {
    if (num1 === 1) {
      this.enqueue(
        PingPongUtil.stringToByte('ff ff ff 00 00 e2 a2 00 12 70 00 00 00 92 e2 a2 97 00'),
      )
    } else if (num1 === 2) {
      this.enqueue(
        PingPongUtil.stringToByte('ff ff ff 00 00 e2 a2 00 12 70 00 00 00 97 f2 92 67 00'),
      )
    } else if (num1 === 3) {
      this.enqueue(
        PingPongUtil.stringToByte('ff ff ff 00 00 e2 a2 00 12 70 00 00 00 72 82 82 77 00'),
      )
    }

    sleepAsync(50)

    if (num2 === 1) {
      this.enqueue(
        PingPongUtil.stringToByte('ff ff ff 01 00 e2 a2 00 12 70 00 00 00 92 e2 a2 97 00'),
      )
    } else if (num2 === 2) {
      this.enqueue(
        PingPongUtil.stringToByte('ff ff ff 01 00 e2 a2 00 12 70 00 00 00 97 f2 92 67 00'),
      )
    } else if (num2 === 3) {
      this.enqueue(
        PingPongUtil.stringToByte('ff ff ff 01 00 e2 a2 00 12 70 00 00 00 72 82 82 77 00'),
      )
    }

    sleepAsync(50)

    if (num3 === 1) {
      this.enqueue(
        PingPongUtil.stringToByte('ff ff ff 02 00 e2 a2 00 12 70 00 00 00 92 e2 a2 97 00'),
      )
    } else if (num3 === 2) {
      this.enqueue(
        PingPongUtil.stringToByte('ff ff ff 02 00 e2 a2 00 12 70 00 00 00 97 f2 92 67 00'),
      )
    } else if (num3 === 3) {
      this.enqueue(
        PingPongUtil.stringToByte('ff ff ff 02 00 e2 a2 00 12 70 00 00 00 72 82 82 77 00'),
      )
    }
  }

  // Sound
  setAggregateMusic = async (cubeNum, music): Promise<void> => {}
}
