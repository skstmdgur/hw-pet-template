export const Color = {
  off: 'O',
  red: 'R',
  green: 'G',
  blue: 'B',
  yellow: 'Y',
  purple: 'P',
  white: 'W',
  skip: 'S'
}
export const Index = {
  menu: 0,
  face: 7,
  faceDirection: 7,
  recordRequest: 8,
  recordResponse: 9,
  centerColor: 9,
  cellColor: 11,
  posDirTor: 12,
  sensingRequest: 28,
  sensingResponse: 28
}
export const Action = {
  faceMove: 1,
  faceResetAll: 2,
  faceMoveWithMotor: 3
}
export const Rotation = {
  zero: 0,
  thirty: 1,
  sixty: 2,
  ninety: 3,
  aHundredTwenty: 4,
  aHundredFifty: 5,
  aHundredEighty: 6
}
export const FaceColor = {
  white: 0,
  yellow: 1,
  green: 2,
  blue: 3,
  red: 4,
  purple: 5,
  all: 7
}
export const CellColor = {
  off: 0,
  red: 1,
  green: 2,
  blue: 3,
  yellow: 4,
  purple: 6,
  white: 7,
  skip: 8
}
export const DirectionState = {
  brake: 0,
  cw: 1,
  ccw: 2,
  passive: 3
}
export const DirectionFromFace = {
  forwardCW: 0,
  forwardCCW: 1,
  rightCW: 2,
  rightCCW: 3,
  leftCW: 4,
  leftCCW: 5,
  upCW: 6,
  upCCW: 7,
  downCW: 8,
  donwCCW: 9,
  backwardCW: 10,
  backwardCCW: 11
}
export const Pitch = {
  C: 0,
  CSharp: 1,
  D: 2,
  DSharp: 3,
  E: 4,
  F: 5,
  FSharp: 6,
  G: 7,
  GSharp: 8,
  A: 9,
  ASharp: 10,
  B: 11,
  Rest: 12
}
export const Switch = {
  Off: 0,
  On: 1
}
export const Mode = {
  main: 0,
  sub: 1
}
export const Record = {
  normal: 0,
  fifthRelay: 1,
  halfBlind: 2,
  fullBlind: 3,
  timePenalty: 4,
  twenty_twentyEightMode: 5,
  minimumRotation: 6,
  zeroTwoMode: 7
}
export const PacketType = {
  sendByte: 7,
  received: 7
}
export const PacketDelimiter = {
  header: 0,
  terminator: 90
}