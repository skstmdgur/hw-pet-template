javascriptGenerator.forBlock['oz71_g2_motor_degree'] = function (block, generator) {
  const dropdown_direction0 = block.getFieldValue('DIRECTION0')
  const number_speed0 = block.getFieldValue('SPEED0')
  const angle_angle0 = block.getFieldValue('ANGLE0')
  const dropdown_direction1 = block.getFieldValue('DIRECTION1')
  const number_speed1 = block.getFieldValue('SPEED1')
  const angle_angle1 = block.getFieldValue('ANGLE1')

  let speed0 = 500
  let speed1 = 500

  if (dropdown_direction0 === 'left') {
    speed0 = number_speed0 * -1
  }
  if (dropdown_direction1 === 'left') {
    speed1 = number_speed1 * -1
  }

  const code = `await makerKit.hw.run(routineContext, "pingpong.setMotorDegree", ${speed0}, ${angle_angle0}, ${speed1}, ${angle_angle1});\n`
  return code
}
