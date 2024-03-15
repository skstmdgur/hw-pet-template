import { type IHPetContext } from '@ktaicoder/hw-pet'
import { sleepAsync } from '@repo/ui'
import { CommandRunnerBase } from './CommandRunnerBase'
import * as PingPongUtil from './pingpong-util'

/**
 * Inherits from the CommandRunnerBase class.
 * CommandRunnerBase handles the aspects related to the connection with hardware,
 * and this class handles the remaining commands that are sent to the hardware.
 */
export class CommandRunnerG1 extends CommandRunnerBase {
  private bleNusServiceUUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e'
  private bleNusCharRXUUID = '6e400002-b5a3-f393-e0a9-e50e24dcca9e'
  private bleNusCharTXUUID = '6e400003-b5a3-f393-e0a9-e50e24dcca9e'
  private rxCharacteristic: BluetoothRemoteGATTCharacteristic | undefined = undefined
  private txCharacteristic: BluetoothRemoteGATTCharacteristic | undefined = undefined

  queue: any
  isSending: boolean
  isSendingDone: boolean
  defaultDelay: number

  sensorG1: { [key: string]: number }
  modelSetting: { [key: string]: { [key: string]: number } }

  groupNumber: string

  constructor(options: IHPetContext) {
    super(options)
    this.queue = []
    this.isSending = false
    this.defaultDelay = 50

    this.sensorG1 = {}
    for (let i = 0; i < 20; i++) {
      this.sensorG1[`Sensor_Byte_${i}`] = 0
    }

    this.modelSetting = {
      MONO: {
        defaultSpeed: 900,
        defaultStepToCM: 49.5,
      },
    }

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
   * command: connect
   *
   * Function to connect to the hardware.
   * Check the connection status in ricConnector.setEventListener().
   * An essential function that must be implemented.
   * @returns The return value is meaningless.
   */
  connect = async (): Promise<boolean> => {
    // console.log('connect', this.groupNumber)
    const device = await this.scan()
    if (!device) {
      // console.log('not device')
      return false
    }
    const server = await device.gatt?.connect()
    const service = await server.getPrimaryService(this.bleNusServiceUUID)

    this.rxCharacteristic = await service?.getCharacteristic(this.bleNusCharRXUUID)
    this.txCharacteristic = await service?.getCharacteristic(this.bleNusCharTXUUID)
    await this.txCharacteristic?.startNotifications()
    this.txCharacteristic?.addEventListener('characteristicvaluechanged', this.receivedBytes)
    this.updateConnectionState_('connected')

    await this.connectToCube()
    await this.startSensor()

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
  //       return device
  //     } else {
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

  /** 
   * 받는 데이터 
   */ 
  receivedBytes = (event: any): void => {
    if (event.target.value.byteLength != 0) {
      // 데이터 LOG 확인용
      // console.log(`Receive ${String(PingPongUtil.byteToStringReceive(event))}`)

      // G1 센서 데이터
      if (
        event.target.value.byteLength === 20 &&
        event.target.value.getUint8(0) === 0xa7 &&
        event.target.value.getUint8(6) === 0xb8
      ) {
        for (let i = 0; i < 20; i++) {
          this.sensorG1[`Sensor_Byte_${i}`] = event.target.value.getUint8(i)
        }
      }
    }
  }

  /** ____________________________________________________________________________________________________ */

  /** 
   * 데이터를 큐에 추가하는 메소드 
   */ 
  enqueue(data: Uint8Array) {
    // console.log(`Send : ${String(PingPongUtil.byteToString(data))}`)
    // 데이터를 20바이트씩 분할하여 큐에 추가
    for (let i = 0; i < data.length; i += 20) {
      const chunk = data.slice(i, i + 20)
      this.queue.push(chunk)
    }
    this.processQueue()
  }

  /** 
   * 큐를 처리하는 메소드
   */ 
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

  /** ____________________________________________________________________________________________________ */

  /** 
   * 모터 토그 강도 설정 
   */ 
  setInstantTorque = async (cubeNum: number, torque: number): Promise<void> => {
    this.enqueue(PingPongUtil.setInstantTorque(cubeNum, torque))
  }

  /** 
   * 1개 큐브 연결 
   */ 
  connectToCube = async (): Promise<void> => {
    this.enqueue(PingPongUtil.getOrangeForSoundData())
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        // console.log('connectToCube done')
        resolve()
      }, 1000)
    })
  }

  /** 
   * 센서 받아오기 시작 
   */
  startSensor = async (): Promise<void> => {
    // console.log('startSensor')
    this.enqueue(PingPongUtil.getSensor())
  }

  /** 
   * 큐브 모터 하나만 움직이기
   * cubeNum : 큐브 총 갯수
   * cubeID : 큐브 순서 (0부터 시작)
   * speed : 속도 (100 ~ 1000)
   * step : 스텝 (0 ~ 1980)
   */ 
  sendSingleStep = async (cubeNum: number, cubeID: number, speed: number, step: number): Promise<void> => {
    this.enqueue(PingPongUtil.makeSingleStep(cubeNum, cubeID, speed, step))
  }

  /** 
   * 근접 센서 값
   * 큐브 모터 하나만 계속 움직이기
   * cubeNum : 큐브 총 갯수
   * cubeID : 큐브 순서 (0부터 시작)
   * speed : 속도 (100 ~ 1000)
   */ 
  sendContinuousStep = async (cubeNum: number, cubeID: number, speed: number): Promise<void> => {
    this.enqueue(PingPongUtil.makeContinuousStep(cubeNum, cubeID, speed))
  }

  /** G1 ____________________________________________________________________________________________________ */

  /** 
   * 버튼 센서값 0~2
   */ 
  getButtonSensor = async (): Promise<number> => {
    return this.sensorG1['Sensor_Byte_11']
  }

  /** 
   * 근접 센서 값
   */ 
  getProximitySensor = async (): Promise<number> => {
    return this.sensorG1['Sensor_Byte_18']
  }

  /** 
   * 소리 센서 값
   */ 
  getSoundSensor = async (): Promise<number> => {
    return this.sensorG1['Sensor_Byte_19']
  }

  /** 
   * 어떤 방향 기울기 센서 값
   */ 
  getFaceTiltAngle = async (figure: String): Promise<number> => {
    if (figure === 'Star') {
      return PingPongUtil.getSignedIntFromByteData(this.sensorG1['Sensor_Byte_16']) * -1
    } else if (figure === 'Triangle') {
      return PingPongUtil.getSignedIntFromByteData(this.sensorG1['Sensor_Byte_15'])
    } else if (figure === 'Square') {
      return PingPongUtil.getSignedIntFromByteData(this.sensorG1['Sensor_Byte_16'])
    } else if (figure === 'Circle') {
      return PingPongUtil.getSignedIntFromByteData(this.sensorG1['Sensor_Byte_15']) * -1
    }
    return 0
  }

  /** 
   * 서브 모터 움직이기
   */ 
  setServoDegree = async (cubeID: number, degree: number): Promise<void> => {
    this.enqueue(PingPongUtil.makeServoDegreeData(cubeID, degree))

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        // console.log(`setServoDegree done`)
        resolve()
      }, this.defaultDelay)
    })
  }

  /** Mono ____________________________________________________________________________________________________ */

  // 모노 거리 이동
  setDistance = async (distance: number): Promise<void> => {
    this.enqueue(
      PingPongUtil.makeSingleStep(
        1,
        7,
        this.modelSetting['MONO']['defaultSpeed'],
        distance * this.modelSetting['MONO']['defaultStepToCM'],
      ),
    )
    const delayTime = PingPongUtil.makeDelayTimeFromSpeedStep(
      this.modelSetting['MONO']['defaultSpeed'],
      distance * this.modelSetting['MONO']['defaultStepToCM'],
    )
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve()
      }, delayTime)
    })
  }
}
