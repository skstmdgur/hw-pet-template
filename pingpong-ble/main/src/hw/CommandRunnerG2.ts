import { type IHPetContext } from '@ktaicoder/hw-pet'
import { sleepAsync } from '@repo/ui'
import { CommandRunnerBase } from './CommandRunnerBase'
import * as PingPongUtil from './pingpong-util'
import { promises } from 'dns'

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

  device: BluetoothDevice | null = null

  queue: any
  isSending: boolean
  defaultDelay: number
  wormBotDelay: number

  sensorG1: { [key: string]: number }
  sensorG2: { [key: string]: number }
  modelSetting: { [key: string]: { [key: string]: number } }

  groupNumber: string
  constructor(options: IHPetContext) {
    super(options)
    this.queue = []
    this.isSending = false
    this.defaultDelay = 64
    this.wormBotDelay = 7000

    this.sensorG1 = {}
    for (let i = 0; i < 20; i++) {
      this.sensorG1[`Sensor_Byte_${i}`] = 0
    }
    this.sensorG2 = {}
    for (let i = 0; i < 20; i++) {
      this.sensorG2[`Sensor_Byte_${i}`] = 0
    }

    this.modelSetting = {
      DEFAULT: {
        defaultSpeed: 50,
        metronome: 60,
      },
      AUTOCAR: {
        defaultSpeed: 50,
        defaultStepToCM: 24.44444,
      },
    }

    this.groupNumber = '00'
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
  // connect = async (): Promise<boolean> => {
  //   console.log('connect', this.groupNumber)
  //   this.device = await this.scan()
  //   if (!this.device) {
  //     // console.log('not device')
  //     return false
  //   }
  //   const server = await this.device.gatt?.connect()
  //   const service = await server.getPrimaryService(this.bleNusServiceUUID)

  //   this.rxCharacteristic = await service?.getCharacteristic(this.bleNusCharRXUUID)
  //   this.txCharacteristic = await service?.getCharacteristic(this.bleNusCharTXUUID)
  //   await this.txCharacteristic?.startNotifications()
  //   this.txCharacteristic?.addEventListener('characteristicvaluechanged', this.receivedBytes)

  //   await this.connectToCubeWithNum(2, this.groupNumber)

  //   return true
  // }

  connect = async (): Promise<boolean> => {
    this.device = await this.scan()
    if (!this.device) {
      console.log('No device found')
      return false
    }

    try {
      const server = await this.device.gatt?.connect()
      const service = await server.getPrimaryService(this.bleNusServiceUUID)

      this.rxCharacteristic = await service?.getCharacteristic(this.bleNusCharRXUUID)
      this.txCharacteristic = await service?.getCharacteristic(this.bleNusCharTXUUID)

      if (!this.txCharacteristic) {
        throw new Error('TX Characteristic not found')
      }

      await this.txCharacteristic.startNotifications()
      this.txCharacteristic.addEventListener('characteristicvaluechanged', this.receivedBytes)

      await this.connectToCubeWithNum(2, this.groupNumber)

      return true
    } catch (error) {
      console.error('Failed to setup Bluetooth connection:', error)
      return false
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
    await this.enqueue(PingPongUtil.rebootMultiroleAggregator())

    // When changing the connection state, be sure to call updateConnectionState_()
    this.connectChangeImage('G2.png')
    this.updateConnectionState_('disconnected')
  }

  scan = async (): Promise<BluetoothDevice | null> => {
    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ namePrefix: 'PINGPONG' }],
        optionalServices: [this.bleNusServiceUUID],
      })
      // console.log('블루투스 디바이스:', device);
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
    if (event.target.value.byteLength != 0) {
      // 데이터 LOG 확인용
      // console.log(`Receive ${String(PingPongUtil.byteToStringReceive(event))}`)

      if (
        event.target.value.byteLength === 20 &&
        event.target.value.getUint8(0) === 0xa0 &&
        event.target.value.getUint8(6) === 0xb8
      ) {
      } else if (
        event.target.value.byteLength === 20 &&
        event.target.value.getUint8(0) === 0xa1 &&
        event.target.value.getUint8(6) === 0xb8
      ) {
      } else {
        // 센서 X 데이터 값
        // console.log(`Receive ${String(PingPongUtil.byteToStringReceive(event))}`)
      }

      if (
        event.target.value.byteLength === 11 &&
        event.target.value.getUint8(4) === 0x20 &&
        event.target.value.getUint8(6) === 0xad
      ) {
        this.connectChangeImage('G2_1.png')
      }
      // 2개 연결 완료
      if (
        event.target.value.byteLength === 18 &&
        event.target.value.getUint8(4) === 0x20 &&
        event.target.value.getUint8(6) === 0xad &&
        event.target.value.getUint8(10) === 0x00 &&
        event.target.value.getUint8(11) === 0x01
      ) {
        // console.log('Connect 2 Cube')
        this.connectChangeImage('G2_2.png')
        this.updateConnectionState_('connected')

        this.awaitStartSensor()
      }

      // G1 센서 데이터
      if (
        event.target.value.byteLength === 20 &&
        event.target.value.getUint8(0) === 0xa0 &&
        event.target.value.getUint8(6) === 0xb8
      ) {
        for (let i = 0; i < 20; i++) {
          this.sensorG1[`Sensor_Byte_${i}`] = event.target.value.getUint8(i)
        }
      }
      // G2 센서 데이터
      if (
        event.target.value.byteLength === 20 &&
        event.target.value.getUint8(0) === 0xa1 &&
        event.target.value.getUint8(6) === 0xb8
      ) {
        for (let i = 0; i < 20; i++) {
          this.sensorG2[`Sensor_Byte_${i}`] = event.target.value.getUint8(i)
        }
      }

      // 음악 데이터
      if (
        event.target.value.byteLength === 11 &&
        event.target.value.getUint8(5) === 0xa1 &&
        event.target.value.getUint8(6) === 0xe8 &&
        event.target.value.getUint8(10) === 0x01
      ) {
        this.startMusic()
      }

      // ScheduledPoints Start
      if (event.target.value.byteLength === 15 && event.target.value.getUint8(6) === 0xcb) {
        this.sendWormBotStart()
      }
    }
  }

  /** ____________________________________________________________________________________________________ */

  // 연결시 이미지 변경
  connectChangeImage(newSrc: string) {
    this.uiEvents.emit('connectChangeImage', newSrc)
  }

  // 데이터를 큐에 추가하는 메소드
  async enqueue(data: Uint8Array) {
    // console.log(`Send : ${String(PingPongUtil.byteToString(data))}`)
    // 데이터를 20바이트씩 분할하여 큐에 추가
    for (let i = 0; i < data.length; i += 20) {
      const chunk = data.slice(i, i + 20)
      this.queue.push(chunk)
    }
    await this.processQueue()
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
    if (!this.rxCharacteristic) {
      console.error('rxCharacteristic is null or undefined')
      return
    }

    if (typeof this.rxCharacteristic.writeValue !== 'function') {
      console.error('writeValue is not a function on rxCharacteristic')
      return
    }

    // Check if the device is connected
    if (!this.device?.gatt?.connected) {
      console.error('Device is disconnected. Trying to reconnect...')
      try {
        if (this.device?.gatt) {
          await this.device.gatt.connect()
        }
      } catch (error) {
        console.error('Failed to reconnect to the device', error)
        return
      }
    }

    try {
      await this.rxCharacteristic.writeValue(packet)
    } catch (error) {
      console.error('Failed to write value to rxCharacteristic', error)
    }

    try {
      await this.rxCharacteristic.writeValue(packet)
    } catch (error) {
      console.error('Failed to write value to rxCharacteristic', error)
    }
  }

  /** ____________________________________________________________________________________________________ */

  setInstantTorque = async (cubeNum: number, torque: number): Promise<void> => {
    await this.enqueue(PingPongUtil.setInstantTorque(cubeNum, torque))
  }

  // cubeNum : 큐브 총 갯수
  connectToCubeWithNum = async (cubeNum: number, groupID: string): Promise<void> => {
    await this.enqueue(PingPongUtil.getSetMultiroleInAction(cubeNum, groupID))
    await sleepAsync(3000)
  }

  awaitStartSensor = async (): Promise<void> => {
    await sleepAsync(1000)
    await this.startSensor()
  }

  startSensor = async (): Promise<void> => {
    await this.enqueue(PingPongUtil.getSensor())
  }

  // cubeNum : 큐브 총 갯수
  // cubeID : 큐브 순서 (0부터 시작)
  // speed : 속도 (100 ~ 1000)
  // step : 스텝 (0 ~ 1980)
  sendSingleStep = async (
    cubeNum: number,
    cubeID: number,
    speed: number,
    step: number,
  ): Promise<void> => {
    const delay = PingPongUtil.makeDelayTimeFromSpeedStep(
      PingPongUtil.changeSpeedToSps(speed),
      Math.round(Math.abs(step)),
    )
    await this.enqueue(PingPongUtil.makeSingleStep(cubeNum, cubeID, speed, step))
    await sleepAsync(delay)
  }

  // cubeNum : 큐브 총 갯수
  // cubeID : 큐브 순서 (0부터 시작)
  // speed : 속도 (100 ~ 1000)
  sendContinuousStep = async (cubeNum: number, cubeID: number, speed: number): Promise<void> => {
    await this.enqueue(PingPongUtil.makeContinuousStep(cubeNum, cubeID, speed))
    await sleepAsync(this.defaultDelay)
  }

  sendAggregator = async (
    cubeNum: number,
    method: number,
    speed0: number,
    step0: number,
    speed1: number,
    step1: number,
  ): Promise<void> => {
    const innerData = new Array(2)
    const delay1 = PingPongUtil.makeDelayTimeFromSpeedStep(
      PingPongUtil.changeSpeedToSps(speed0),
      Math.round(Math.abs(step0)),
    )
    const delay2 = PingPongUtil.makeDelayTimeFromSpeedStep(
      PingPongUtil.changeSpeedToSps(speed1),
      Math.round(Math.abs(step1)),
    )
    const delay = delay1 > delay2 ? delay1 : delay2

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

    await this.enqueue(PingPongUtil.makeAggregateStep(cubeNum, innerData, method))
  }
  /** Setting Default ____________________________________________________________________________________________________ */

  setMotorDefaultSpeed = async (speed: number): Promise<void> => {
    this.modelSetting['DEFAULT']['defaultSpeed'] = speed
  }

  setMotorAutoCarSpeed = async (speed: number): Promise<void> => {
    this.modelSetting['AUTOCAR']['defaultSpeed'] = speed
  }

  /** G2 ____________________________________________________________________________________________________ */
  /** __________ G2 Motor __________ */

  setMotorContinuous = async (speed0: number, speed1: number): Promise<void> => {
    const sps0 = PingPongUtil.changeSpeedToSps(speed0)
    const sps1 = PingPongUtil.changeSpeedToSps(speed1)
    await this.sendAggregator(2, 0, sps0, 0, sps1, 0)
    await sleepAsync(this.defaultDelay)
  }

  setMotorStep = async (
    speed0: number,
    step0: number,
    speed1: number,
    step1: number,
  ): Promise<void> => {
    const sps0 = PingPongUtil.changeSpeedToSps(speed0)
    const sps1 = PingPongUtil.changeSpeedToSps(speed1)

    const delay0 = PingPongUtil.makeDelayTimeFromSpeedStep(sps0, step0)
    const delay1 = PingPongUtil.makeDelayTimeFromSpeedStep(sps1, step1)
    const delayTime = delay0 > delay1 ? delay0 : delay1

    await this.sendAggregator(2, 1, sps0, step0, sps1, step1)

    await sleepAsync(delayTime)
  }

  setMotorDegree = async (
    speed0: number,
    degree0: number,
    speed1: number,
    degree1: number,
  ): Promise<void> => {
    const sps0 = PingPongUtil.changeSpeedToSps(speed0)
    const sps1 = PingPongUtil.changeSpeedToSps(speed1)
    const step0 = PingPongUtil.changeDegreeToStep(degree0)
    const step1 = PingPongUtil.changeDegreeToStep(degree1)

    const delay0 = PingPongUtil.makeDelayTimeFromSpeedStep(
      PingPongUtil.changeSpeedToSps(Math.abs(speed0)),
      step0,
    )
    const delay1 = PingPongUtil.makeDelayTimeFromSpeedStep(
      PingPongUtil.changeSpeedToSps(Math.abs(speed1)),
      step1,
    )
    const delayTime = delay0 > delay1 ? delay0 : delay1

    console.log('speed0 : ', speed0)
    console.log('speed1 : ', speed1)
    console.log('sps1 : ', sps1)
    console.log('sps0 : ', sps0)

    console.log('step0 : ', step0)
    console.log('step1 : ', step1)

    console.log('delay0 : ', PingPongUtil.changeSpeedToSps(Math.abs(speed0)))
    console.log('delay1 : ', PingPongUtil.changeSpeedToSps(Math.abs(speed1)))

    console.log('delay0 : ', delay0)
    console.log('delay1 : ', delay1)
    console.log('delayTime : ', delayTime)

    await this.sendAggregator(2, 1, sps0, step0, sps1, step1)

    await sleepAsync(delayTime)
  }

  setMotorStop = async (): Promise<void> => {
    await this.sendAggregator(2, 0, 0, 0, 0, 0)
  }

  /** __________ G1 Sensor __________ */

  /**
   * 버튼 센서값 0~2
   */
  getButtonSensor = async (cubeID: number): Promise<number> => {
    switch (cubeID) {
      case 0:
        return this.sensorG1['Sensor_Byte_11']

      case 1:
        return this.sensorG2['Sensor_Byte_11']
    }
  }

  ifButtonSensor = async (cubeID: number): Promise<boolean> => {
    switch (cubeID) {
      case 0:
        if (this.sensorG1['Sensor_Byte_11'] > 0) return true
        break
      case 1:
        if (this.sensorG2['Sensor_Byte_11'] > 0) return true
        break
    }

    return false
  }

  getFaceTiltAngle = async (cubeID: number, figure: String): Promise<number> => {
    let faceTiltAngleData = 0

    switch (cubeID) {
      case 0:
        switch (figure) {
          case 'Star':
            faceTiltAngleData =
              PingPongUtil.getSignedIntFromByteData(this.sensorG1['Sensor_Byte_16']) * -1
            break
          case 'Triangle':
            faceTiltAngleData = PingPongUtil.getSignedIntFromByteData(
              this.sensorG1['Sensor_Byte_15'],
            )
            break
          case 'Square':
            faceTiltAngleData = PingPongUtil.getSignedIntFromByteData(
              this.sensorG1['Sensor_Byte_16'],
            )
            break
          case 'Circle':
            faceTiltAngleData =
              PingPongUtil.getSignedIntFromByteData(this.sensorG1['Sensor_Byte_15']) * -1
            break
          default:
            break
        }
        break
      case 1:
        switch (figure) {
          case 'Star':
            faceTiltAngleData =
              PingPongUtil.getSignedIntFromByteData(this.sensorG2['Sensor_Byte_16']) * -1
            break
          case 'Triangle':
            faceTiltAngleData = PingPongUtil.getSignedIntFromByteData(
              this.sensorG2['Sensor_Byte_15'],
            )
            break
          case 'Square':
            faceTiltAngleData = PingPongUtil.getSignedIntFromByteData(
              this.sensorG2['Sensor_Byte_16'],
            )
            break
          case 'Circle':
            faceTiltAngleData =
              PingPongUtil.getSignedIntFromByteData(this.sensorG2['Sensor_Byte_15']) * -1
            break
          default:
            break
        }
        break
      default:
        break
    }

    return faceTiltAngleData
  }

  /**
   * 큐브 윗면에 어떤 모양이 있는가
   */
  ifUpperTilt = async (cubeID: number, figure: String): Promise<boolean> => {
    switch (cubeID) {
      case 0:
        if (figure === 'Square') {
          if (PingPongUtil.getSignedIntFromByteData(this.sensorG1['Sensor_Byte_16']) < -70)
            return true
        }
        if (figure === 'Triangle') {
          if (PingPongUtil.getSignedIntFromByteData(this.sensorG1['Sensor_Byte_15']) < -70)
            return true
        }
        if (figure === 'Star') {
          if (PingPongUtil.getSignedIntFromByteData(this.sensorG1['Sensor_Byte_16']) > 70)
            return true
        }
        if (figure === 'Circle') {
          if (PingPongUtil.getSignedIntFromByteData(this.sensorG1['Sensor_Byte_15']) > 70)
            return true
        }
        if (figure === 'None') {
          if (PingPongUtil.getSignedIntFromByteData(this.sensorG1['Sensor_Byte_16']) < -70)
            return true
        }
        if (figure === 'Heart') {
          if (PingPongUtil.getSignedIntFromByteData(this.sensorG1['Sensor_Byte_16']) < -70)
            return true
        }
        break
      case 1:
        if (figure === 'Square') {
          if (PingPongUtil.getSignedIntFromByteData(this.sensorG2['Sensor_Byte_16']) < -70)
            return true
        }
        if (figure === 'Triangle') {
          if (PingPongUtil.getSignedIntFromByteData(this.sensorG2['Sensor_Byte_15']) < -70)
            return true
        }
        if (figure === 'Star') {
          if (PingPongUtil.getSignedIntFromByteData(this.sensorG2['Sensor_Byte_16']) > 70)
            return true
        }
        if (figure === 'Circle') {
          if (PingPongUtil.getSignedIntFromByteData(this.sensorG2['Sensor_Byte_15']) > 70)
            return true
        }
        if (figure === 'None') {
          if (PingPongUtil.getSignedIntFromByteData(this.sensorG2['Sensor_Byte_16']) < -70)
            return true
        }
        if (figure === 'Heart') {
          if (PingPongUtil.getSignedIntFromByteData(this.sensorG2['Sensor_Byte_16']) < -70)
            return true
        }
        break
    }

    return false
  }

  /**
   * 근접 센서 값
   */
  getProximitySensor = async (cubeID: number): Promise<number> => {
    let proximitySensorData = 0

    switch (cubeID) {
      case 0:
        proximitySensorData = this.sensorG1['Sensor_Byte_18']
        break
      case 1:
        proximitySensorData = this.sensorG2['Sensor_Byte_18']
        break
    }

    return proximitySensorData
  }

  getSoundSensor = async (cubeID: number): Promise<number> => {
    let soundSensorData = 0

    switch (cubeID) {
      case 0:
        soundSensorData = this.sensorG1['Sensor_Byte_19']
        break
      case 1:
        soundSensorData = this.sensorG2['Sensor_Byte_19']
        break
    }

    return soundSensorData
  }

  /** __________ G2 Music __________ */

  setMetronome = async (metronome: number): Promise<void> => {
    this.modelSetting['DEFAULT']['metronome'] = metronome
  }

  startMusic = async (): Promise<void> => {
    await this.enqueue(PingPongUtil.makeMusicPlay(2))
    await sleepAsync(this.defaultDelay)
  }

  // notesAndRests : note, rest
  // pianoKey : La_3 ~ Do_6
  // duration : 4, 3, 2, 1.5, 1, 0.5, 0.25
  sendMusic = async (
    cubeID: number,
    notesAndRests: string,
    pianoKey: string,
    duration: string,
  ): Promise<void> => {
    let cube0data: Uint8Array
    let cube1data: Uint8Array
    let musicData: Uint8Array

    const pianoKeyData = PingPongUtil.changeMusicPianoKey(pianoKey)
    const durationData = PingPongUtil.changeMusicDuration(
      duration,
      this.modelSetting['DEFAULT']['metronome'],
    )

    // if (notesAndRests === 'note') {
    //   if (cubeID === 0) {
    //     cube0data = PingPongUtil.makeMusicData(0, 1, notesAndRests, pianoKeyData, durationData)
    //     cube1data = PingPongUtil.makeMusicData(1, 1, notesAndRests, pianoKeyData, durationData)
    //     musicData = new Uint8Array([...cube0data, ...cube1data]);
    //   } else if (cubeID === 1) {
    //     cube0data = PingPongUtil.makeMusicData(0, 1, notesAndRests, pianoKeyData, durationData)
    //     cube1data = PingPongUtil.makeMusicData(1, 1, notesAndRests, pianoKeyData, durationData)
    //     musicData = new Uint8Array([...cube0data, ...cube1data]);
    //   }
    // }

    // if (musicData === undefined) {
    //   return
    // }

    // this.enqueue(PingPongUtil.makeAggregateMusic(2, musicData))
    await this.enqueue(
      PingPongUtil.makeMusicData(cubeID, 1, notesAndRests, pianoKeyData, durationData),
    )
    await sleepAsync(durationData * 20)
  }

  // Auto Car ____________________________________________________________________________________________________
  // speed (0 ~ 100)
  moveAutoCar = async (speed: number, distance: number): Promise<void> => {
    const innerAutoCarData = new Array(2)
    const delay = PingPongUtil.makeDelayTimeFromSpeedStep(
      PingPongUtil.changeSpeedToSps(speed),
      Math.round(Math.abs(distance) * 24.44444),
    )

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

    await this.enqueue(PingPongUtil.makeAggregateStep(2, innerAutoCarData, 1))
    await sleepAsync(delay)
  }

  // speed (0 ~ 100)
  turnAutoCar = async (speed: number, angle: number): Promise<void> => {
    const innerAutoCarData = new Array(2)
    const delay = PingPongUtil.makeDelayTimeFromSpeedStep(
      PingPongUtil.changeSpeedToSps(speed),
      Math.round(Math.abs(angle) * 2.25),
    )

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

    await this.enqueue(PingPongUtil.makeAggregateStep(2, innerAutoCarData, 1))
    await sleepAsync(delay)
  }

  // Rolling Car ____________________________________________________________________________________________________
  // distance 1 = 큐브 1면 90도 회전
  moveRollingCar = async (speed: number, distance: number): Promise<void> => {
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

    await this.enqueue(PingPongUtil.makeAggregateStep(2, innerAutoCarData, 1))
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

    await this.enqueue(PingPongUtil.makeAggregateStep(2, innerAutoCarData, 1))
  }

  // Worm Bot ____________________________________________________________________________________________________

  selectWormBot = async (): Promise<void> => {
    await this.enqueue(
      PingPongUtil.stringToByte(
        'ff ff ff aa 20 00 cd 02 43 02 03 00 00 ff ff ff 00 00 00 ca 01 1b 02 03 00 01 c5 17 fc a5 00 f8 03 5b 00 f8 fc 7c 00 f8 00 00 02 58 03 5b 00 f8 fc 7c 00 f8 00 00 02 58 03 5b 00 f8 00 00 02 58 00 00 03 20 fc a5 00 f8 00 00 02 58 03 84 00 f8 fc a5 00 f8 00 00 02 58 03 84 00 f8 fc a5 00 f8 00 00 02 58 03 5b 00 f8 00 00 03 20 fc 41 01 ef 03 97 01 ef 03 97 01 ef 01 1a 00 6e fc 48 02 5d 00 00 02 26 02 ff 00 a5 fd 5c 00 a5 00 00 03 20 fc f2 00 dc 02 b3 00 dc 01 1a 00 6e 03 3c 01 4a fc 80 01 b8 fc 23 01 ef 03 dd 01 ef 00 00 02 bc 00 00 03 20 fc 41 01 ef 03 97 01 ef 00 00 03 20 fc 23 01 ef 03 dd 01 ef 00 00 02 bc 00 00 03 20 02 b9 00 f8 fc 8d 00 8a 03 73 00 8a fc 8d 00 8a 03 73 00 8a fc 7d 01 f0 03 73 00 8a fc 8d 00 8a 03 73 00 8a fc 8d 00 8a fc 7e 00 f7 03 82 01 ef fc 7d 00 f8 03 ab 01 f0 fc 55 01 f0 03 ab 01 f0 fc 55 00 f8 fc 23 01 ef 03 dd 01 ef 00 00 02 bc 00 00 03 20 00 00 03 e8 ff ff ff 01 00 00 ca 01 1b 02 03 00 01 48 bf fc a5 00 f8 00 00 02 58 03 84 00 f8 fc a5 00 f8 00 00 02 58 03 84 00 f8 fc a5 00 f8 00 00 02 58 03 5b 00 f8 00 00 03 20 fc a5 00 f8 03 5b 00 f8 fc 7c 00 f8 00 00 02 58 03 5b 00 f8 fc 7c 00 f8 00 00 02 58 03 5b 00 f8 00 00 02 58 00 00 03 20 fc f2 00 dc 02 b3 00 dc 01 1a 00 6e 03 3c 01 4a fc 80 01 b8 fc 23 01 ef 03 dd 01 ef 00 00 02 bc 00 00 03 20 fc 41 01 ef 03 97 01 ef 03 97 01 ef 01 1a 00 6e fc 48 02 5d 00 00 02 26 02 ff 00 a5 fd 5c 00 a5 00 00 03 20 fc f2 00 dc 02 b3 00 dc 00 00 03 20 00 00 02 26 02 ff 00 a5 fd 5c 00 a5 00 00 03 20 02 b9 00 f8 fc 8d 00 8a 03 73 00 8a fc 8d 00 8a 03 73 00 8a fc 7d 01 f0 03 73 00 8a fc 8d 00 8a 03 73 00 8a fc 8d 00 8a fd 20 00 89 03 49 01 81 03 83 00 f8 fc 55 01 f0 03 ab 01 f0 fc 55 01 f0 03 ab 00 f8 00 00 02 26 02 ff 00 a5 fd 5c 00 a5 00 00 03 20 00 00 03 e8',
      ),
    )
    await sleepAsync(5000)
  }

  sendWormBotStart = async (): Promise<void> => {
    await this.enqueue(PingPongUtil.stringToByte('ff ff ff ff 00 00 c0 00 0a 02'))
    await sleepAsync(512)
  }

  sendWormBotFront = async (): Promise<void> => {
    await this.enqueue(
      PingPongUtil.stringToByte('ff ff ff ff 00 00 cb 00 14 02 04 04 01 00 00 00 00 00 09 01'),
    )
    await sleepAsync(7000)
  }

  sendWormBotBack = async (): Promise<void> => {
    await this.enqueue(
      PingPongUtil.stringToByte('ff ff ff ff 00 00 cb 00 14 02 04 04 01 00 00 00 0a 00 13 01'),
    )
    await sleepAsync(7000)
  }

  sendWormBotDumbFront = async (): Promise<void> => {
    await this.enqueue(
      PingPongUtil.stringToByte('ff ff ff ff 00 00 cb 00 14 02 04 04 01 00 00 00 14 00 1c 01'),
    )
    await sleepAsync(7000)
  }

  sendWormBotDumbBack = async (): Promise<void> => {
    await this.enqueue(
      PingPongUtil.stringToByte('ff ff ff ff 00 00 cb 00 14 02 04 04 01 00 00 00 1d 00 25 01'),
    )
    await sleepAsync(7000)
  }

  sendWormBotStand = async (): Promise<void> => {
    await this.enqueue(
      PingPongUtil.stringToByte('ff ff ff ff 00 00 cb 00 14 02 04 04 01 00 00 00 26 00 28 01'),
    )
    await sleepAsync(4000)
  }

  sendWormBotDown = async (): Promise<void> => {
    await this.enqueue(
      PingPongUtil.stringToByte('ff ff ff ff 00 00 cb 00 14 02 04 04 01 00 00 00 29 00 2c 01'),
    )
    await sleepAsync(4000)
  }

  sendWormBotDance = async (): Promise<void> => {
    await this.enqueue(
      PingPongUtil.stringToByte('ff ff ff ff 00 00 cb 00 14 02 04 04 01 00 00 00 2d 00 41 01'),
    )
    await sleepAsync(12000)
  }

  // // test lab

  // sendTest = async (packet: string): Promise<void> => {
  //   this.enqueue(PingPongUtil.stringToByte(packet))
  // }
}
