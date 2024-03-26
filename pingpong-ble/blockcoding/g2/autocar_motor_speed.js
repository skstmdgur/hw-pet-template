javascriptGenerator.forBlock['oz71_autocar_motor_speed'] = function (block, generator) {
  const number_speed = block.getFieldValue('SPEED')
  const dropdown_direction = block.getFieldValue('DIRECTION')
  let speed0 = number_speed * -1
  let speed1 = number_speed

  if (dropdown_direction === 'back') {
    speed0 = speed0 * -1
    speed1 = speed1 * -1
  }

  const code = `await makerKit.hw.run(routineContext, "pingpong.setMotorContinuous", ${speed0}, ${speed1})\n`
  return code
}
