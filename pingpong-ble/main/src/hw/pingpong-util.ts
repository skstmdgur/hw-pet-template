//connect
export const getOrangeForSoundData = (): Uint8Array => {
  const data = new Uint8Array(14)
  data[0] = 0xff
  data[1] = 0xff
  data[2] = 0x00
  data[3] = 0x07
  data[4] = 0x00
  data[5] = 0x00
  data[6] = 0xce
  data[7] = 0x00
  data[8] = 0x0e
  data[9] = 0x02
  data[10] = 0x00
  data[11] = 0x00
  data[12] = 0x07
  data[13] = 0x50

  return data
}

export const getSetMultiroleInAction = (cubeNum: number): Uint8Array => {
  const data = new Uint8Array(11)

  data[0] = 0xff
  data[1] = 0xff
  data[2] = 0xff
  data[3] = 0xff
  data[4] = cubeNum << 4
  data[5] = 0x00
  data[6] = 0xad
  data[7] = 0x00
  data[8] = 0x0b
  data[9] = 0x0a
  data[10] = 0x00

  // if(GroupPid != 0){
  //     txCharSendTest[9] = 0x1a;
  //     txCharSendTest[10] = GroupPid;
  // }

  return data
}

export const makeSingleStep = (cubeNum, cubeID, speed, step): Uint8Array => {
  const data = new Uint8Array(19)

  data[0] = 0xff
  data[1] = 0xff
  data[2] = 0xff
  data[3] = cubeID

  data[4] = cubeNum << 4
  data[5] = 0x00

  data[6] = 0xc1
  data[7] = 0x00
  data[8] = 0x13
  data[9] = 0x01
  data[10] = 0x01
  data[11] = 0x00
  data[12] = 0x02
  data[13] = intToByte(speed)[0]
  data[14] = intToByte(speed)[1]
  data[15] = 0x00
  data[16] = 0x00
  data[17] = intToByte(step)[0]
  data[18] = intToByte(step)[1]

  return data
}

export const makeContinuousStep = (cubeNum, cubeID, speed): Uint8Array => {
  const data = new Uint8Array(15)

  data[0] = 0xff
  data[1] = 0xff
  data[2] = 0xff
  data[3] = cubeID

  data[4] = cubeNum << 4
  data[5] = 0x00

  data[6] = 0xcc

  data[7] = 0x00
  data[8] = 0x0f

  data[9] = 0x01
  data[10] = 0x00
  data[11] = 0x00
  data[12] = 0x02

  data[13] = intToByte(speed)[0]
  data[14] = intToByte(speed)[1]

  return data
}

export const makeAggregateStep = (cubeNum, innerData, method): Uint8Array => {
  const packetSize = 13 + innerData[0].length * innerData.length
  const data = new Uint8Array(packetSize)

  data[0] = 0xff
  data[1] = 0xff
  data[2] = 0xff
  data[3] = 0xaa

  data[4] = cubeNum << 4
  data[5] = 0x00

  data[6] = 0xcd

  data[7] = intToByte(packetSize)[0]
  data[8] = intToByte(packetSize)[1]

  data[9] = 0x02
  // Continuous : 0
  // Single : 1
  // ScheduledStep : 3
  // ScheduledPoint : 4
  data[10] = method
  data[11] = 0x00
  data[12] = 0x00

  for (let i = 0; i < innerData.length; i++) {
    for (let j = 0; j < innerData[i].length; j++) {
      data[13 + innerData[i].length * i + j] = innerData[i][j]
    }
  }

  return data
}

/** ____________________________________________________________________________________________________ */

// torque : 0(min) ~ 1(max)
export const setInstantTorque = (cubeNum, torque): Uint8Array => {
  const data = new Uint8Array(10)
  data[0] = 0xff
  data[1] = 0xff
  data[2] = 0xff
  data[3] = 0xff
  data[4] = cubeNum << 4
  data[5] = 0x00
  data[6] = 0xc6
  data[7] = 0x00
  data[8] = 0x0a
  data[9] = torque
  return data
}

export const byteToString = (data: Uint8Array): String => {
  let hexStr = ''
  const hexSpace = ' '

  for (let i = 0; i < data.byteLength; i++) {
    // 각 바이트를 16진수로 변환
    const hex = data[i].toString(16).padStart(2, '0')
    hexStr += hex + hexSpace
  }

  // 공백 제거
  hexStr.trim()
  return hexStr
}

export const byteToStringReceive = (event: any): String => {
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

export const stringToByte = (packet: string): Uint8Array => {
  const hexArray = packet.split(' ')
  const byteArray = hexArray.map((hex) => parseInt(hex, 16))

  const buffer = new Uint8Array(byteArray)

  return buffer
}

export const intToByte = (int: number): Uint8Array => {
  const intToByteData = new Uint8Array(2)
  intToByteData[0] = (int >> 8) & 0xff // 상위 바이트
  intToByteData[1] = int & 0xff // 하위 바이트
  return intToByteData
}

// Speed : 0 ~ 100
// Sps : 100 ~ 1000
export const changeSpeedToSps = (speed: number): number => {
  return (speed * 1100 - 10000) / speed
}
