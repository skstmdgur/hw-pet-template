import {
  Action,
  FaceColor,
  Index,
  Mode,
  PacketDelimiter,
  PacketType,
} from './ExMarsCubeDefine'

export class ExMarsCubePacket {
  faceCell = new Array(6)
  faceRotDir = new Array(6)
  record = new Array(8)
  currentMode = new Array(2)  
  readonly sendPacketType = PacketType.sendByte

  txPacket = (
    index: number,
    param1: number,
    param2: number,
    param3: number,
    param4: number,
  ): Array<number> => {
    const buffer = new Array<number>(this.sendPacketType)

    buffer[0] = PacketDelimiter.header
    buffer[1] = index
    buffer[2] = param1
    buffer[3] = param2
    buffer[4] = param3
    buffer[5] = param4
    buffer[6] = PacketDelimiter.terminator

    return buffer
  }

  txPacketMenuSetting = (main: number, sub: number): Array<number> => {
    return this.txPacket(Index.menu, 11, main, sub, 255)
  }

  txPacketModeSetting = (index: number, mode: number): Array<number> => {
    return this.txPacket(Index.menu, 30, index, mode, 255)
  }

  txPacketSetCenterColor = (face: number, color: number): Array<number> => {
    const index = (face << 5) | Index.centerColor
    return this.txPacket(index, color, 0, 0, 0)
  }

  txPacketSetCellColor = (
    face: number,
    color1: number,
    color2: number,
    color3: number,
    color4: number,
    color5: number,
    color6: number,
    color7: number,
    color8: number,
  ): Array<number> => {
    const index = (face << 5) | Index.cellColor
    const para1 = (color1 << 4) | color2
    const para2 = (color3 << 4) | color4
    const para3 = (color5 << 4) | color6
    const para4 = (color7 << 4) | color8

    return this.txPacket(index, para1, para2, para3, para4)
  }

  txPacketSetPosDirTor = (
    face: number,
    position: number,
    direction: number,
    torque: number,
  ): Array<number> => {
    const index = (face << 5) | Index.posDirTor
    let pos = 0

    if (position < 2) {
      pos = 2
    } else if (position > 141) {
      pos = 141
    } else {
      pos = position
    }

    return this.txPacket(index, pos, direction, torque, 0)
  }

  txPacketMoveFace = (face: number, rotation: number): Array<number> => {
    let para = 0
    let buffer = new Array<number>(this.sendPacketType)

    if (rotation >= 0 && rotation <= 15) {
      if (face === FaceColor.white || face === FaceColor.green || face === FaceColor.red) {
        para = (rotation << 4) & 240
      } else if (
        face === FaceColor.yellow ||
        face === FaceColor.blue ||
        face === FaceColor.purple
      ) {
        para = rotation & 15
      }
    }

    if (face === FaceColor.white || face === FaceColor.yellow) {
      buffer = this.txPacket(Index.face, Action.faceMove, para, 0, 0)
    } else if (face === FaceColor.green || face === FaceColor.blue) {
      buffer = this.txPacket(Index.face, Action.faceMove, 0, para, 0)
    } else if (face === FaceColor.red || face === FaceColor.purple) {
      buffer = this.txPacket(Index.face, Action.faceMove, 0, 0, para)
    }

    return buffer
  }

  txPacketResetAllFace = (): Array<number> => {
    return this.txPacket(Index.face, Action.faceResetAll, 0, 0, 0)
  }

  txPacketFaceMoveWithMotor = (face: number, rotation: number): Array<number> => {
    let para = 0
    let buffer = new Array<number>(this.sendPacketType)

    if (rotation >= 0  && rotation <= 15) {
      if (face === FaceColor.white || face === FaceColor.green || face === FaceColor.red) {
        para = (rotation << 4) & 240
      } else if (
        face === FaceColor.yellow ||
        face === FaceColor.blue ||
        face === FaceColor.purple
      ) {
        para = rotation & 15
      }
    }

    if (face === FaceColor.white || face === FaceColor.yellow) {
      buffer = this.txPacket(Index.face, Action.faceMoveWithMotor, para, 0, 0)
    } else if (face === FaceColor.green || face === FaceColor.blue) {
      buffer = this.txPacket(Index.face, Action.faceMoveWithMotor, 0, para, 0)
    } else if (face === FaceColor.red || face === FaceColor.purple) {
      buffer = this.txPacket(Index.face, Action.faceMoveWithMotor, 0, 0, para)
    }

    return buffer
  }

  txPacketFacesMoveWithMotor = (
    face1: number,
    rotation1: number,
    face2: number,
    rotation2: number,
  ): Array<number> => {
    let para2 = 0
    let para3 = 0
    let para4 = 0

    switch (face1) {
      case FaceColor.white:
        para2 |= (rotation1 << 4) & 240
        break
      case FaceColor.yellow:
        para2 |= rotation1 & 15
        break
      case FaceColor.green:
        para3 |= (rotation1 << 4) & 240
        break
      case FaceColor.blue:
        para3 |= rotation1 & 15
        break
      case FaceColor.red:
        para4 |= (rotation1 << 4) & 240
        break
      case FaceColor.purple:
        para4 |= rotation1 & 15
        break
    }
    switch (face2) {
      case FaceColor.white:
        para2 |= (rotation2 << 4) & 240
        break
      case FaceColor.yellow:
        para2 |= rotation2 & 15
        break
      case FaceColor.green:
        para3 |= (rotation2 << 4) & 240
        break
      case FaceColor.blue:
        para3 |= rotation2 & 15
        break
      case FaceColor.red:
        para4 |= (rotation2 << 4) & 240
        break
      case FaceColor.purple:
        para4 |= rotation2 & 15
        break
    }

    return this.txPacket(Index.face, Action.faceMoveWithMotor, para2, para3, para4)
  }

  txPacketDiceStart = (dice: number): Array<number> => {
    const index = Index.menu
    return this.txPacket(index, 21, dice, 255, 255)
  }

  txPacketRecord = (recordIndex: number): Array<number> => {
    const index = (7 << 5) | Index.recordRequest
    return this.txPacket(index, recordIndex, 255, 255, 255)
  }

  txPacketSensingRequest = (): Array<number> => {
    const index = (FaceColor.all << 5) | Index.sensingRequest
    return this.txPacket(index, 255, 255, 255, 255)
  }

  rxParser = async(packet: Array<number>): Promise<void> => {
    const index = packet[1] & 31

    if (index === Index.menu) {
      this.currentMode[Mode.main] = packet[3]
      this.currentMode[Mode.sub] = packet[4]
    } else if (index === Index.sensingResponse) {
      const face = (packet[1] >> 5) & 15

      if (face <= 0 && face <= 5) {
        if (face === FaceColor.white) {
          this.faceCell[face][0] = (packet[3] >> 4) & 15
          this.faceCell[face][1] = packet[3] & 15
          this.faceCell[face][2] = (packet[4] >> 4) & 15
          this.faceCell[face][3] = packet[4] & 15
          this.faceCell[face][4] = (packet[5] >> 4) & 15
          this.faceCell[face][5] = packet[5] & 15
          this.faceCell[face][6] = (packet[2] >> 4) & 15
          this.faceCell[face][7] = packet[2] & 15
        } else if (face === FaceColor.yellow) {
          this.faceCell[face][0] = (packet[2] >> 4) & 15
          this.faceCell[face][1] = packet[2] & 15
          this.faceCell[face][2] = (packet[3] >> 4) & 15
          this.faceCell[face][3] = packet[3] & 15
          this.faceCell[face][4] = (packet[4] >> 4) & 15
          this.faceCell[face][5] = packet[4] & 15
          this.faceCell[face][6] = (packet[5] >> 4) & 15
          this.faceCell[face][7] = packet[5] & 15
        } else if (face === FaceColor.green) {
          this.faceCell[face][0] = (packet[3] >> 4) & 15
          this.faceCell[face][1] = packet[3] & 15
          this.faceCell[face][2] = (packet[4] >> 4) & 15
          this.faceCell[face][3] = packet[4] & 15
          this.faceCell[face][4] = (packet[5] >> 4) & 15
          this.faceCell[face][5] = packet[5] & 15
          this.faceCell[face][6] = (packet[2] >> 4) & 15
          this.faceCell[face][7] = packet[2] & 15
        } else if (face === FaceColor.blue) {
          this.faceCell[face][0] = (packet[4] >> 4) & 15
          this.faceCell[face][1] = packet[4] & 15
          this.faceCell[face][2] = (packet[5] >> 4) & 15
          this.faceCell[face][3] = packet[5] & 15
          this.faceCell[face][4] = (packet[2] >> 4) & 15
          this.faceCell[face][5] = packet[2] & 15
          this.faceCell[face][6] = (packet[3] >> 4) & 15
          this.faceCell[face][7] = packet[3] & 15
        } else if (face === FaceColor.red) {
          this.faceCell[face][0] = (packet[3] >> 4) & 15
          this.faceCell[face][1] = packet[3] & 15
          this.faceCell[face][2] = (packet[4] >> 4) & 15
          this.faceCell[face][3] = packet[4] & 15
          this.faceCell[face][4] = (packet[5] >> 4) & 15
          this.faceCell[face][5] = packet[5] & 15
          this.faceCell[face][6] = (packet[2] >> 4) & 15
          this.faceCell[face][7] = packet[2] & 15
        } else if (face === FaceColor.purple) {
          this.faceCell[face][0] = (packet[4] >> 4) & 15
          this.faceCell[face][1] = packet[4] & 15
          this.faceCell[face][2] = (packet[5] >> 4) & 15
          this.faceCell[face][3] = packet[5] & 15
          this.faceCell[face][4] = (packet[2] >> 4) & 15
          this.faceCell[face][5] = packet[2] & 15
          this.faceCell[face][6] = (packet[3] >> 4) & 15
          this.faceCell[face][7] = packet[3] & 15
        }
      } else if (face === 7) {
        this.faceCell[FaceColor.white][0] = (((packet[2] & 3) << 1) | ((packet[3] >> 7) & 1)) & 7
        this.faceCell[FaceColor.white][1] = (packet[3] >> 4) & 7
        this.faceCell[FaceColor.white][2] = (packet[3] >> 1) & 7
        this.faceCell[FaceColor.white][3] = (((packet[3] & 1) << 2) | ((packet[4] >> 6) & 3)) & 7
        this.faceCell[FaceColor.white][4] = (packet[4] >> 3) & 7
        this.faceCell[FaceColor.white][5] = packet[4] & 7
        this.faceCell[FaceColor.white][6] = (packet[2] >> 5) & 7
        this.faceCell[FaceColor.white][7] = (packet[2] >> 2) & 7

        this.faceCell[FaceColor.yellow][0] = (packet[5] >> 5) & 7
        this.faceCell[FaceColor.yellow][1] = (packet[5] >> 2) & 7
        this.faceCell[FaceColor.yellow][2] = (((packet[5] & 3) << 1) | ((packet[6] >> 7) & 1)) & 7
        this.faceCell[FaceColor.yellow][3] = (packet[6] >> 4) & 7
        this.faceCell[FaceColor.yellow][4] = (packet[6] >> 1) & 7
        this.faceCell[FaceColor.yellow][5] = (((packet[6] & 1) << 2) | ((packet[7] >> 6) & 3)) & 7
        this.faceCell[FaceColor.yellow][6] = (packet[7] >> 3) & 7
        this.faceCell[FaceColor.yellow][7] = packet[7] & 7

        this.faceCell[FaceColor.green][0] = (((packet[8] & 3) << 1) | ((packet[9] >> 7) & 1)) & 7
        this.faceCell[FaceColor.green][1] = (packet[9] >> 4) & 7
        this.faceCell[FaceColor.green][2] = (packet[9] >> 1) & 7
        this.faceCell[FaceColor.green][3] = (((packet[9] & 1) << 2) | ((packet[10] >> 6) & 3)) & 7
        this.faceCell[FaceColor.green][4] = (packet[10] >> 3) & 7
        this.faceCell[FaceColor.green][5] = packet[10] & 7
        this.faceCell[FaceColor.green][6] = (packet[8] >> 5) & 7
        this.faceCell[FaceColor.green][7] = (packet[8] >> 2) & 7

        this.faceCell[FaceColor.blue][0] = (packet[12] >> 1) & 7
        this.faceCell[FaceColor.blue][1] = (((packet[12] & 1) << 2) | ((packet[13] >> 6) & 3)) & 7
        this.faceCell[FaceColor.blue][2] = (packet[13] >> 3) & 7
        this.faceCell[FaceColor.blue][3] = packet[13] & 7
        this.faceCell[FaceColor.blue][4] = (packet[11] >> 5) & 7
        this.faceCell[FaceColor.blue][5] = (packet[11] >> 2) & 7
        this.faceCell[FaceColor.blue][6] = (((packet[11] & 3) << 1) | ((packet[12] >> 7) & 1)) & 7
        this.faceCell[FaceColor.blue][7] = (packet[12] >> 4) & 7

        this.faceCell[FaceColor.red][0] = (((packet[14] & 3) << 1) | ((packet[15] >> 7) & 1)) & 7
        this.faceCell[FaceColor.red][1] = (packet[15] >> 4) & 7
        this.faceCell[FaceColor.red][2] = (packet[15] >> 1) & 7
        this.faceCell[FaceColor.red][3] = (((packet[15] & 1) << 2) | ((packet[16] >> 6) & 3)) & 7
        this.faceCell[FaceColor.red][4] = (packet[16] >> 3) & 7
        this.faceCell[FaceColor.red][5] = packet[16] & 7
        this.faceCell[FaceColor.red][6] = (packet[14] >> 5) & 7
        this.faceCell[FaceColor.red][7] = (packet[14] >> 2) & 7

        this.faceCell[FaceColor.purple][0] = (packet[18] >> 1) & 7
        this.faceCell[FaceColor.purple][1] = (((packet[18] & 1) << 2) | ((packet[19] >> 6) & 3)) & 7
        this.faceCell[FaceColor.purple][2] = (packet[19] >> 3) & 7
        this.faceCell[FaceColor.purple][3] = packet[19] & 7
        this.faceCell[FaceColor.purple][4] = (packet[17] >> 5) & 7
        this.faceCell[FaceColor.purple][5] = (packet[17] >> 2) & 7
        this.faceCell[FaceColor.purple][6] = (((packet[17] & 3) << 1) | ((packet[18] >> 7) & 1)) & 7
        this.faceCell[FaceColor.purple][7] = (packet[18] >> 4) & 7
      }
    } else if (index === Index.faceDirection) {
      if (packet[2] === 1) {
        this.faceRotDir[FaceColor.white] = (packet[3] >> 4) & 15
        this.faceRotDir[FaceColor.yellow] = packet[3] & 15
        this.faceRotDir[FaceColor.green] = (packet[4] >> 4) & 15
        this.faceRotDir[FaceColor.blue] = packet[4] & 15
        this.faceRotDir[FaceColor.red] = (packet[5] >> 4) & 15
        this.faceRotDir[FaceColor.purple] = packet[5] & 15
      }
    } else if (index === Index.recordResponse) {
      // 0: 최신, 1: 차순 ... , 5: 최고
      const recordIndex = (packet[1] >> 5) & 15
      this.record[recordIndex][packet[2]] = (packet[3] << 16) | (packet[4] << 8) | packet[5]
    }
  }

  calculrateAngle = (rotation: number, angle: number): number => {
    return rotation === 2 ? (angle += 8) : angle
  }

  convertEnumType = (fromObj: any, toObj: any, value: any): any => {
    const key = Object.keys(fromObj).find((key) => fromObj[key] === value)
    return key ? toObj[key] : 'undefind'
  }
}