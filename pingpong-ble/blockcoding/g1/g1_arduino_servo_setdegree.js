javascriptGenerator.forBlock['pingpong1_g1_arduino_servo_setdegree'] = function (block) {
  const value_distance = generator.valueToCode(block, 'DISTANCE', Order.ATOMIC)
  const code = `await makerKit.hw.run(routineContext, "pingpong.setServoDegree", ${7}, ${value_distance});\n`
  return code
}