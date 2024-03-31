import { HPetEventKeys } from '@ktaicoder/hw-pet'
import type {
  HPetEventDefinition,
  ConnectionState,
  IHPetCommandRunner,
  IHPetContext,
  IParentSender,
} from '@ktaicoder/hw-pet'
import type EventEmitter from 'eventemitter3'
import {
  CellColor,
  Color,
  DirectionFromFace,
  FaceColor,
  Mode,
  PacketDelimiter,
  Pitch,
  Record,
  Rotation,
  Switch,
} from './exMarsCube/ExMarsCubeDefine'
import { sleepAsync } from '@/util/misc'
import { ExMarsCubePacket } from './exMarsCube/ExMarsCubePacket'
import { FIFO } from './exMarsCube/FIFO'

/**
 * Inherits from the CommandRunnerBase class.
 * CommandRunnerBase handles the aspects related to the connection with hardware,
 * and this class handles the remaining commands that are sent to the hardware.
 */
export class CommandRunner extends ExMarsCubePacket implements IHPetCommandRunner {  
  private connectionState: ConnectionState = 'disconnected'
  private hwId: string
  private toParent: IParentSender
  private events: EventEmitter<HPetEventDefinition>
  private bleNusServiceUUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e'
  private bleNusCharRXUUID = '6e400002-b5a3-f393-e0a9-e50e24dcca9e'
  private bleNusCharTXUUID = '6e400003-b5a3-f393-e0a9-e50e24dcca9e'  
  private rxCharacteristic: BluetoothRemoteGATTCharacteristic | undefined = undefined
  private txCharacteristic: BluetoothRemoteGATTCharacteristic | undefined = undefined
  private rxLoopFlag: boolean
  private fifo: FIFO

  constructor(options: IHPetContext) {
    super()
    this.hwId = options.hwId
    this.toParent = options.toParent
    this.events = options.events

    this.rxLoopFlag = false
    this.fifo = new FIFO()
  }

  /**
   * Lifecycle function, Automatically called.
   * An essential function that must be implemented.
   * Called once before communicating with parent frame (CODINY).
   * Initialization tasks, such as registering event listeners, can be performed here.
   */
  init = async (): Promise<void> => {
    // 변수 및 배열 초기화
    for (let i = 0; i < this.faceCell.length; i++) {
      this.faceCell[i] = new Array<number>(9)
      for (let j = 0; j < 8; j++) {
        this.faceCell[i][j] = 0
      }
      this.faceCell[i][8] = i
    }
    for (let i = 0; i < this.faceRotDir.length; i++) {
      this.faceRotDir[i] = 0
    }
    for (let i = 0; i < this.record.length; i++) {
      this.record[i] = new Array<number>(6)
      for (let j = 0; j < 6; j++) {
        this.record[i][j] = 0
      }
    }
    for (let i = 0; i < this.currentMode.length; i++) {
      this.currentMode[i] = 0
    }
  }

  /**
   * Lifecycle function, Automatically called.
   * An essential function that must be implemented.
   * Called once after the connection with the hardware is terminated.
   * Cleanup tasks, such as unregistering event listeners, can be performed here.
   */
  destroy = async () => {
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
      this.events.emit(HPetEventKeys.connectionStateChanged, this.connectionState)

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
   * command: connect
   *
   * Function to connect to the hardware.
   * Check the connection status in ricConnector.setEventListener().
   * An essential function that must be implemented.
   * @returns The return value is meaningless.
   */
  connect = async (): Promise<boolean> => {
    const device = await this.scan()
    if (!device) {
      return false
    } else {
      const server = await device.gatt?.connect()
      const service = await server.getPrimaryService(this.bleNusServiceUUID)

      this.rxCharacteristic = await service?.getCharacteristic(this.bleNusCharRXUUID)
      this.txCharacteristic = await service?.getCharacteristic(this.bleNusCharTXUUID)      
      await this.txCharacteristic?.startNotifications()
      this.txCharacteristic?.addEventListener("characteristicvaluechanged", this.receivedBytes)      
      this.updateConnectionState_('connected')

      this.rxLoopFlag = true
      this.rxLoop()
      return true
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
    this.rxLoopFlag = false
    // When changing the connection state, be sure to call updateConnectionState_()
    this.updateConnectionState_('disconnected')
  }

  sendBytes = async(packet: Array<number>): Promise<void> => {
    const buffer = new Uint8Array(packet)
    await this.rxCharacteristic?.writeValue(buffer)
  }

  receivedBytes = (event: any): void => {
    const value: DataView = event.target.value
    const length: number = value.byteLength
    const received = new Array<number>(length)

    for (let i = 0; i < length; i++) {
      received[i] = value.getUint8(i)
    }
    this.fifo.enqueue(received)
  }

  scan = async(): Promise<BluetoothDevice | null> => {
    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ namePrefix: 'eX-Mars' }],
        optionalServices: [ this.bleNusServiceUUID ]
      })
      return device
    } catch (e) {
      return null
    }
  }

  private rxLoop = async(): Promise<void> => {
    while (this.rxLoopFlag) {
      // 서로 다른 패킷이 한 배열로 반환될 경우 패킷별로 분할 됨.
      if (this.fifo.count() > 0) {
        const packet = await this.fifo.dequeue()
        let headerFlag = false
        let headerArr = 0
        for (let i = 0; i < packet.length; i++) {
          if (!headerFlag && packet[i] === PacketDelimiter.header) {
            headerFlag = true
            headerArr = i
          }
          if (headerFlag && packet[i] === PacketDelimiter.terminator) {
            const result = []
            for (let j = headerArr; j < i + 1; j++) {
              result.push(packet[j])
            }
            await this.rxParser(result)
            headerFlag = false
          }
        }
      }
      await sleepAsync(20)
    }
  }

  getCellColor = async(face: string, cell: string): Promise<string> => {
    const value = this.faceCell[parseInt(face)][parseInt(cell)]
    const buffer = this.txPacketSensingRequest()
    await this.sendBytes(buffer)
    return this.convertEnumType(parseInt(cell) < 8 ? CellColor : FaceColor, Color, value).toString()
  }

  getFaceColor = async (face: string): Promise<string[]> => {
    const colors: Array<string> = new Array<string>(9)
    for (let cell = 0; cell < 9; cell++) {
      const value = this.faceCell[parseInt(face)][cell]
      colors[cell] = this.convertEnumType(cell < 8 ? CellColor : FaceColor, Color, value).toString()
    }
    const buffer = this.txPacketSensingRequest()
    await this.sendBytes(buffer)
    return colors
  }

  getFaceRotationValue = async (face: string): Promise<string> => {
    const dir = this.faceRotDir[parseInt(face)]
    this.faceRotDir[parseInt(face)] = 0
    switch (dir) {
      case 3:
        return 'CW'
      case 11:
        return 'CCW'
      default:
        return '0'
    }
  }

  getModeRecord = async(mode: string, record: string): Promise<number> => {
    return Math.floor(this.record[parseInt(mode)][parseInt(record)]) / 1000 // value / 10 / 100(%)
  }

  getDiceNumberRecord = async(record: string): Promise<number> => {
    return Math.floor(this.record[Record.zeroTwoMode][parseInt(record)]) / 1000 // value / 10 / 100(%)
  }

  getModeStatus = async (): Promise<string> => {
    const status = `${this.currentMode[Mode.main]}${this.currentMode[Mode.sub]}`
    return status
  }

  setMenuInit = async(): Promise<void> => {
    const buffer = this.txPacketMenuSetting(10, 10)
    await this.sendBytes(buffer)
    await sleepAsync(20)
  }

  setModeSetting = async(main: string, sub: string): Promise<void> => {
    const buffer = this.txPacketMenuSetting(parseInt(main), parseInt(sub))
    await this.sendBytes(buffer)
    await sleepAsync(20)
  }

  setPlayMode = async(scale: string): Promise<void> => {
    const buffer = this.txPacketModeSetting(3, parseInt(scale))
    await this.sendBytes(buffer)
    await sleepAsync(20)
  }

  setUserMode = async(user: string): Promise<void> => {
    const buffer = this.txPacketModeSetting(1, parseInt(user))
    await this.sendBytes(buffer)
    await sleepAsync(20)
  }

  setNonBrake = async(flag: string): Promise<void> => {
    let buffer = new Array<number>(this.sendPacketType)
    switch (parseInt(flag)) {
      case Switch.Off:
        buffer = this.txPacketMenuSetting(13, 4)
        break
      case Switch.On:
        buffer = this.txPacketMenuSetting(9, 3)
        break
    }
    await this.sendBytes(buffer)
    await sleepAsync(20)
  }

  setResetAllFace = async(): Promise<void> => {
    const buffer = this.txPacketResetAllFace()
    await this.sendBytes(buffer)
    await sleepAsync(20)
  }

  setResetRotation = async(): Promise<void> => {
    for (let i = 0; i < this.faceRotDir.length; i++) {
      this.faceRotDir[i] = 0
    }
    await sleepAsync(20)
  }

  setCenterColorChange = async(face: string, color: string): Promise<void> => {
    const buffer = this.txPacketSetCenterColor(parseInt(face), parseInt(color))
    await this.sendBytes(buffer)
    await sleepAsync(20)
  }

  setCellColorChange = async(
    face: string,
    colorCell1: string,
    colorCell2: string,
    colorCell3: string,
    colorCell4: string,
    colorCell5: string,
    colorCell6: string,
    colorCell7: string,
    colorCell8: string,
  ): Promise<void> => {
    const buffer = this.txPacketSetCellColor(
      parseInt(face),
      parseInt(colorCell1),
      parseInt(colorCell2),
      parseInt(colorCell3),
      parseInt(colorCell4),
      parseInt(colorCell5),
      parseInt(colorCell6),
      parseInt(colorCell7),
      parseInt(colorCell8),
    )
    await this.sendBytes(buffer)
    await sleepAsync(20)
  }

  setPositionDirectionTorqueChange = async(
    face: string,
    position: string,
    rotationDirection: string,
    torque: string,
  ): Promise<void> => {
    const buffer = this.txPacketSetPosDirTor(
      parseInt(face),
      parseInt(position),
      parseInt(rotationDirection),
      parseInt(torque),
    )
    await this.sendBytes(buffer)
    await sleepAsync(20)
  }

  setFaceRotationOnlyColor = async(face: string, rotationDirection: string, angle: string): Promise<void> => {
    const buffer = this.txPacketMoveFace(
      parseInt(face),
      this.calculrateAngle(parseInt(rotationDirection), parseInt(angle)),
    )
    await this.sendBytes(buffer)
    await sleepAsync(20)
  }

  setFaceRotation = async(face: string, rotationDirection: string, angle: string): Promise<void> => {
    const buffer = this.txPacketFaceMoveWithMotor(
      parseInt(face),
      this.calculrateAngle(parseInt(rotationDirection), parseInt(angle)),
    )
    await this.sendBytes(buffer)
    await sleepAsync(20)
  }
  setFacesRotation = async(
    face1: string,
    rotationDirection1: string,
    angle1: string,
    face2: string,
    rotationDirection2: string,
    angle2: string,
  ): Promise<void> => {
    const buffer = this.txPacketFacesMoveWithMotor(
      parseInt(face1),
      this.calculrateAngle(parseInt(rotationDirection1), parseInt(angle1)),
      parseInt(face2),
      this.calculrateAngle(parseInt(rotationDirection2), parseInt(angle2)),
    )
    await this.sendBytes(buffer)
    await sleepAsync(20)
  }

  setSolveCube = async(
    faceColor: string,
    faceLocation: string,
    seconds: string,
  ): Promise<void> => {
    const fc = parseInt(faceColor)
    const fl = parseInt(faceLocation)
    let face = FaceColor.yellow
    let angle = Rotation.ninety
    if (fl % 2 === 1) {
      angle += 8
    }
    if (fc === FaceColor.green) {
      switch (fl) {
        case DirectionFromFace.forwardCW:
        case DirectionFromFace.forwardCCW:
          face = FaceColor.green
          break
        case DirectionFromFace.rightCW:
        case DirectionFromFace.rightCCW:
          face = FaceColor.purple
          break
        case DirectionFromFace.leftCW:
        case DirectionFromFace.leftCCW:
          face = FaceColor.red
          break
        case DirectionFromFace.upCW:
        case DirectionFromFace.upCCW:
          face = FaceColor.yellow
          break
        case DirectionFromFace.downCW:
        case DirectionFromFace.donwCCW:
          face = FaceColor.white
          break
        case DirectionFromFace.backwardCW:
        case DirectionFromFace.backwardCCW:
          face = FaceColor.blue
          break
      }
    } else if (fc === FaceColor.purple) {
      switch (fl) {
        case DirectionFromFace.forwardCW:
        case DirectionFromFace.forwardCCW:
          face = FaceColor.purple
          break
        case DirectionFromFace.rightCW:
        case DirectionFromFace.rightCCW:
          face = FaceColor.blue
          break
        case DirectionFromFace.leftCW:
        case DirectionFromFace.leftCCW:
          face = FaceColor.green
          break
        case DirectionFromFace.upCW:
        case DirectionFromFace.upCCW:
          face = FaceColor.yellow
          break
        case DirectionFromFace.downCW:
        case DirectionFromFace.donwCCW:
          face = FaceColor.white
          break
        case DirectionFromFace.backwardCW:
        case DirectionFromFace.backwardCCW:
          face = FaceColor.red
          break
      }
    } else if (fc === FaceColor.blue) {
      switch (fl) {
        case DirectionFromFace.forwardCW:
        case DirectionFromFace.forwardCCW:
          face = FaceColor.blue
          break
        case DirectionFromFace.rightCW:
        case DirectionFromFace.rightCCW:
          face = FaceColor.red
          break
        case DirectionFromFace.leftCW:
        case DirectionFromFace.leftCCW:
          face = FaceColor.purple
          break
        case DirectionFromFace.upCW:
        case DirectionFromFace.upCCW:
          face = FaceColor.yellow
          break
        case DirectionFromFace.downCW:
        case DirectionFromFace.donwCCW:
          face = FaceColor.white
          break
        case DirectionFromFace.backwardCW:
        case DirectionFromFace.backwardCCW:
          face = FaceColor.green
          break
      }
    } else if (fc === FaceColor.red) {
      switch (fl) {
        case DirectionFromFace.forwardCW:
        case DirectionFromFace.forwardCCW:
          face = FaceColor.red
          break
        case DirectionFromFace.rightCW:
        case DirectionFromFace.rightCCW:
          face = FaceColor.green
          break
        case DirectionFromFace.leftCW:
        case DirectionFromFace.leftCCW:
          face = FaceColor.blue
          break
        case DirectionFromFace.upCW:
        case DirectionFromFace.upCCW:
          face = FaceColor.yellow
          break
        case DirectionFromFace.downCW:
        case DirectionFromFace.donwCCW:
          face = FaceColor.white
          break
        case DirectionFromFace.backwardCW:
        case DirectionFromFace.backwardCCW:
          face = FaceColor.purple
          break
      }
    }
    const buffer = this.txPacketFaceMoveWithMotor(face, angle)
    await this.sendBytes(buffer)
    await sleepAsync(parseFloat(seconds) * 1000)
  }

  setPlayNote = async(pitchName: string, seconds: string): Promise<void> => {
    let face = FaceColor.white
    let angle = 3

    if (parseInt(pitchName) !== 12) {
      if (parseInt(pitchName) % 2 === 1) {
        angle += 8
      }
      switch (parseInt(pitchName)) {
        case Pitch.C:
        case Pitch.CSharp:
          face = FaceColor.white
          break
        case Pitch.D:
        case Pitch.DSharp:
          face = FaceColor.yellow
          break
        case Pitch.E:
        case Pitch.F:
          face = FaceColor.green
          break
        case Pitch.FSharp:
        case Pitch.G:
          face = FaceColor.blue
          break
        case Pitch.GSharp:
        case Pitch.A:
          face = FaceColor.red
          break
        case Pitch.ASharp:
        case Pitch.B:
          face = FaceColor.purple
          break
      }

      const buffer = this.txPacketFaceMoveWithMotor(face, angle)
      await this.sendBytes(buffer)
      await sleepAsync(parseFloat(seconds) * 1000)
    }
  }

  setReturnModeRecord = async(mode: string): Promise<void> => {
    const buffer = this.txPacketRecord(parseInt(mode))
    await this.sendBytes(buffer)
    await sleepAsync(20)
  }

  setDiceStart = async(dice: string): Promise<void> => {
    const buffer = this.txPacketDiceStart(parseInt(dice))
    await this.sendBytes(buffer)
    await sleepAsync(20)
  }

  setReturnDiceNumberRecord = async(): Promise<void> => {
    const buffer = this.txPacketRecord(Record.zeroTwoMode)
    await this.sendBytes(buffer)
    await sleepAsync(20)
  }

  setAutoSolveCube = async(): Promise<void> => {
    const buffer = this.txPacketRecord(7)
    await this.sendBytes(buffer)
    await sleepAsync(20)
  }

  setReturnCallCellColor = async(): Promise<void> => {
    const buffer = this.txPacketSensingRequest()
    await this.sendBytes(buffer)
    await sleepAsync(20)
  }
}
