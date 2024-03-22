javascriptGenerator.forBlock['oz71_g2_motor_countinous'] = function (block, generator) {
  const dropdown_direction0 = block.getFieldValue('DIRECTION0')
  const number_speed0 = block.getFieldValue('SPEED0')
  const dropdown_direction1 = block.getFieldValue('DIRECTION1')
  const number_speed1 = block.getFieldValue('SPEED1')

  let speed0 = number_speed0
  let speed1 = number_speed1

  if (dropdown_direction0 === 'left') {
    number_speed0 = number_speed0 * -1
  }
  if (dropdown_direction1 === 'left') {
    number_speed1 = number_speed1 * -1
  }

  const code = `await makerKit.hw.run(routineContext, "pingpong.setMotorContinuous", ${number_speed0}, ${number_speed1})`
  return code
}
