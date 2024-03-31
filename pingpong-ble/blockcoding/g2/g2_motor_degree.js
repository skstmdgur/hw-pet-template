javascriptGenerator.forBlock['pingpong2_g2_motor_degree'] = function (block, generator) {
  const dropdown_direction0 = block.getFieldValue('DIRECTION0')
  const value_speed0 = generator.valueToCode(block, 'SPEED0', Order.ATOMIC)
  const value_angle0 = generator.valueToCode(block, 'ANGLE0', Order.ATOMIC)
  const dropdown_direction1 = block.getFieldValue('DIRECTION1')
  const value_speed1 = generator.valueToCode(block, 'SPEED1', Order.ATOMIC)
  const value_angle1 = generator.valueToCode(block, 'ANGLE1', Order.ATOMIC)

  let speed0 = 500
  let speed1 = 500

  if (dropdown_direction0 === 'left') {
    speed0 = value_speed0 * -1
  }
  if (dropdown_direction1 === 'left') {
    speed1 = value_speed1 * -1
  }

  const code = `await makerKit.hw.run(routineContext, "pingpong.setMotorDegree", ${speed0}, ${value_angle0}, ${speed1}, ${value_angle1});\n`
  return code
}
