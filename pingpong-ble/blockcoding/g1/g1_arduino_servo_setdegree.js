javascriptGenerator.forBlock['pingpong1_g1_arduino_servo_setdegree'] = function (block, generator) {
  const value_degree = generator.valueToCode(block, 'DEGREE', Order.ATOMIC)

  const code = `await makerKit.hw.run(routineContext, "pingpong.setServoDegree", ${7}, ${value_degree});\n`

  return code
}
