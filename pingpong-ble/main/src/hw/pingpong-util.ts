import exp from 'constants'

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

export const getSetMultiroleInAction = (cubeNum: number, groupID: string): Uint8Array => {
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

  if(groupID === '00'){
    data[9] = 0x0a
    data[10] = 0x00
  } else {
    data[9] = 0x1a;
    data[10] = parseInt(groupID, 10);
  }

  return data
}

export const rebootMultiroleAggregator = (): Uint8Array => {
  const data = new Uint8Array(10)

  data[0] = 0xff
  data[1] = 0xff
  data[2] = 0xff
  data[3] = 0xff
  //assign id
  data[4] = 0x00
  data[5] = 0x00
  //opcode
  data[6] = 0xA8
  //packet size
  data[7] = 0x00
  data[8] = 0x0A
  //method
  data[9] = 0x01

  return data  
}

export const getSensor = (): Uint8Array => {
  const data = new Uint8Array(11)

  data[0] = 0xff
  data[1] = 0xff
  data[2] = 0xff
  data[3] = 0xff
  //assign id
  data[4] = 0x00
  data[5] = 0xc8
  //opcode
  data[6] = 0xb8
  //packet size
  data[7] = 0x00
  data[8] = 0x0b
  //method
  data[9] = 0x10
  data[10] = 0x01

  return data
}

export const makeServoDegreeData = (cubeID, degree): Uint8Array => {
  const data = new Uint8Array(13)

  if (degree > 180) degree = 180
  if (degree < 0) degree = 0

  data[0] = 0xff
  data[1] = 0xff
  data[2] = 0xff
  data[3] = cubeID

  data[4] = 0x00
  data[5] = 0x00

  data[6] = 0xe1

  data[7] = 0x00
  data[8] = 0x0d

  data[9] = 0x00
  data[10] = 0x01

  data[11] = degree
  data[12] = 0x00

  return data
}

// playAndStop : play : 0x02, stop : 0x01
// notesAndRests : note, rest
export const makeMusicData = (
  cubeID,
  playAndStop,
  notesAndRests,
  pianoKey,
  duration,
): Uint8Array => {
  const data = new Uint8Array(14)

  data[0] = 0xff
  data[1] = 0xff
  data[2] = 0xff
  data[3] = cubeID

  data[4] = 0x00
  data[5] = 0xa1

  data[6] = 0xe8

  data[7] = 0x00
  data[8] = 0x0e

  data[9] = 0x00
  data[10] = 0x01
  // data[10] = playAndStop

  // Piano Key
  data[11] = pianoKey
  // Duration
  data[12] = 0x00
  // Rest
  data[13] = 0x00

  if (notesAndRests === 'note') {
    data[12] = duration
    data[13] = 0x00
  }
  if (notesAndRests === 'rest') {
    data[12] = 0x00
    data[13] = duration
  }

  return data
}

//playAndStop : play : 0x02, stop : 0x01
export const makeMusicPlay = (playAndStop): Uint8Array => {
  const data = new Uint8Array(11)

  data[0] = 0xff
  data[1] = 0xff
  data[2] = 0xff
  data[3] = 0xff

  data[4] = 0x00
  data[5] = 0xe8

  data[6] = 0xe8

  data[7] = 0x00
  data[8] = 0x0b

  data[9] = playAndStop
  data[10] = 0x00

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

export const makeDelayTimeFromSpeedStep = (speed, step): number => {
  // 1회전당 걸리는 시간
  const oneRotationSecond = Math.pow(2, (1000 - speed) / 100)
  // 1980 = 1회전당 스텝
  const oneRotationStep = step / 1980
  const delayTime = oneRotationSecond * oneRotationStep * 1000

  console.log(`oneRotationSecond : ${oneRotationSecond}, oneRotationStep : ${oneRotationStep}`)
  console.log(`delayTime : ${delayTime}`)

  return delayTime + 1000
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

export const getSignedIntFromByteData = (byteData): number => {
  // 입력 값을 10진수로 파싱하고, 8비트로 제한하기 위해 & 0xFF를 사용
  var data = parseInt(byteData, 10) & 0xff
  // 0x80은 128을 16진수로 표현
  // 비트 7이 설정되어 있다면(즉, 값이 128 이상이라면), 0xFFFFFF00을 AND 연산
  // 부호 있는 32비트 정수로 확장
  if (data & 0x80) data = (data & 0xff) - 0x100

  // 최대 90도까지만 표현
  if (data > 90) data = 90
  if (data < -90) data = -90

  return data
}

/** ____________________________________________________________________________________________________ */

export const changeMusicNotesAndRests = (notesAndRests: string): number => {
  let notesAndRestsData = 0

  switch (notesAndRests) {
    case 'note':
      notesAndRestsData = 0
      break
    case 'rest':
      notesAndRestsData = 1
      break
  }

  return notesAndRestsData
}

export const changeMusicPianoKey = (pianoKey: string): number => {
  let pianoKeyData = 0

  switch (pianoKey) {
    case 'La_3':
      pianoKeyData = 37
      break
    case 'La#_3':
      pianoKeyData = 38
      break
    case 'Si_3':
      pianoKeyData = 39
      break
    case 'Do_4':
      pianoKeyData = 40
      break
    case 'Do#_4':
      pianoKeyData = 41
      break
    case 'Re_4':
      pianoKeyData = 42
      break
    case 'Re#_4':
      pianoKeyData = 43
      break
    case 'Mi_4':
      pianoKeyData = 44
      break
    case 'Fa_4':
      pianoKeyData = 45
      break
    case 'Fa#_4':
      pianoKeyData = 46
      break
    case 'Sol_4':
      pianoKeyData = 47
      break
    case 'Sol#_4':
      pianoKeyData = 48
      break
    case 'La_4':
      pianoKeyData = 49
      break
    case 'La#_4':
      pianoKeyData = 50
      break
    case 'Si_4':
      pianoKeyData = 51
      break
    case 'Do_5':
      pianoKeyData = 52
      break
    case 'Do#_5':
      pianoKeyData = 53
      break
    case 'Re_5':
      pianoKeyData = 54
      break
    case 'Re#_5':
      pianoKeyData = 55
      break
    case 'Mi_5':
      pianoKeyData = 56
      break
    case 'Fa_5':
      pianoKeyData = 57
      break
    case 'Fa#_5':
      pianoKeyData = 58
      break
    case 'Sol_5':
      pianoKeyData = 59
      break
    case 'Sol#_5':
      pianoKeyData = 60
      break
    case 'La_5':
      pianoKeyData = 61
      break
    case 'La#_5':
      pianoKeyData = 62
      break
    case 'Si_5':
      pianoKeyData = 63
      break
    case 'Do_6':
      pianoKeyData = 64
      break
  }

  return pianoKeyData
}

export const changeMusicDuration = (duration: string): number => {
  let durationData = 0

  console.log(`duration : ${duration}`)

  switch (duration) {
    case 'Whole':
      console.log(`Whole`)
      durationData = 200
      break
    case 'DottedHalf':
      console.log(`DottedHalf`)
      durationData = 150
      break
    case 'Half':
      console.log(`Half`)
      durationData = 100
      break
    case 'DottedQuarter':
      console.log(`DottedQuarter`)
      durationData = 75
      break
    case 'Quarter':
      console.log(`Quarter`)
      durationData = 50
      break
    case 'Eighth':
      console.log(`Eighth`)
      durationData = 25
      break
    case 'Sixteenth':
      console.log(`Sixteenth`)
      durationData = 12
      break
  }

  console.log(`durationData : ${durationData}`)

  return durationData
}
