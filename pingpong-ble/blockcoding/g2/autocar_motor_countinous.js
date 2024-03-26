javascriptGenerator.forBlock['oz71_autocar_motor_countinous'] = function (block, generator) {
  const dropdown_direction0 = block.getFieldValue('DIRECTION0')
  const number_speed0 = block.getFieldValue('SPEED0')
  const dropdown_direction1 = block.getFieldValue('DIRECTION1')
  const number_speed1 = block.getFieldValue('SPEED1')

  let speed0 = number_speed0
  let speed1 = number_speed1

  if (dropdown_direction0 === 'left') {
    speed0 = number_speed0 * -1
  }
  if (dropdown_direction1 === 'left') {
    speed1 = number_speed1 * -1
  }

  const code = `await makerKit.hw.run(routineContext, "pingpong.setMotorContinuous", ${speed0}, ${speed1});\n`
  return code
}
