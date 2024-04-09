javascriptGenerator.forBlock['pingpong1_g1_motor_degree'] = function (block, generator) {
  const dropdown_direction = block.getFieldValue('DIRECTION')
  const value_speed = generator.valueToCode(block, 'SPEED', Order.ATOMIC)
  const value_angle = generator.valueToCode(block, 'ANGLE', Order.ATOMIC)
  let speed = value_speed

  if (dropdown_direction === 'left') {
    speed = value_speed * -1
  }

  const code = `await makerKit.hw.run(routineContext, "pingpong.setMotorDegree", ${speed}, ${value_angle});\n`
  return code
}
