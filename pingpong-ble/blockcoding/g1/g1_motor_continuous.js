javascriptGenerator.forBlock['pingpong1_g1_motor_countinous'] = function (block, generator) {
  const dropdown_direction = block.getFieldValue('DIRECTION')
  const value_speed = generator.valueToCode(block, 'SPEED', Order.ATOMIC)
  let speed = value_speed

  if (dropdown_direction === 'left') {
    speed = value_speed * -1
  }

  const code = `await makerKit.hw.run(routineContext, 'pingpong.setMotorContinuous', ${speed});\n`
  return code
}
