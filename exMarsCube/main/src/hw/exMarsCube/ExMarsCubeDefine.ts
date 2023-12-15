export type Packet = Array<number>
export enum Color {
  off = 'O',
  red = 'R',
  green = 'G',
  blue = 'B',
  yellow = 'Y',
  purple = 'P',
  white = 'W',
  skip = 'S',
}
export enum Index {
  menu = 0,
  face = 7,
  faceDirection = 7,
  recordRequest = 8,
  recordResponse = 9,
  centerColor = 9,
  cellColor = 11,
  posDirTor = 12,
  sensingRequest = 28,
  sensingResponse = 28,
}
export enum Action {
  faceMove = 1,
  faceResetAll,
  faceMoveWithMotor,
}
export enum Rotation {
  zero,
  thirty,
  sixty,
  ninety,
  aHundredTwenty,
  aHundredFifty,
  aHundredEighty,
}
export enum FaceColor {
  white,
  yellow,
  green,
  blue,
  red,
  purple,
  all = 7,
}
export enum CellColor {
  off,
  red,
  green,
  blue,
  yellow,
  purple = 6,
  white,
  skip,
}
export enum DirectionState {
  brake,
  cw,
  ccw,
  passive,
}
export enum DirectionFromFace {
  forwardCW,
  forwardCCW,
  rightCW,
  rightCCW,
  leftCW,
  leftCCW,
  upCW,
  upCCW,
  downCW,
  donwCCW,
  backwardCW,
  backwardCCW,
}
export enum Pitch {
  C,
  CSharp,
  D,
  DSharp,
  E,
  F,
  FSharp,
  G,
  GSharp,
  A,
  ASharp,
  B,
  Rest,
}
export enum Switch {
  Off,
  On,
}
export enum Mode {
  main,
  sub,
}
export enum Record {
  normal,
  fifthRelay,
  halfBlind,
  fullBlind,
  timePenalty,
  twenty_twentyEightMode,
  minimumRotation,
  zeroTwoMode,
}
export enum PacketType {
  sendByte = 7,
  received = 7,
}
export enum PacketDelimiter {
  header = 0,
  terminator = 90,
}