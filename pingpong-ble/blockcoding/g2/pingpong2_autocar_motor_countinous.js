javascriptGenerator.forBlock['pingpong2_autocar_motor_countinous'] = function(block, generator) {
  const dropdown_direction0 = block.getFieldValue('DIRECTION0')
  const value_speed0 = generator.valueToCode(block, 'SPEED0', Order.ATOMIC)
  const dropdown_direction1 = block.getFieldValue('DIRECTION1')
  const value_speed1 = generator.valueToCode(block, 'SPEED1', Order.ATOMIC)

  let speed0 = value_speed0
  let speed1 = value_speed1

  if (dropdown_direction0 === "left") {
    speed0 = value_speed0 * -1
  }
  if (dropdown_direction1 === "left") {
    speed1 = value_speed1 * -1
  }

  const code = `await makerKit.hw.run(routineContext, "pingpong.setMotorContinuous", ${speed0}, ${speed1});\n`
  return code
}