javascriptGenerator.forBlock['pingpong2_autocar_motor_speed'] = function(block, generator) {
  const value_speed = generator.valueToCode(block, 'SPEED', Order.ATOMIC)
  const dropdown_direction = block.getFieldValue('DIRECTION')

  let speed0 = value_speed * -1
  let speed1 = value_speed

  if(dropdown_direction === "back"){
    speed0 = speed0 * -1
    speed1 = speed1 * -1
  }

  const code = `await makerKit.hw.run(routineContext, "pingpong.setMotorContinuous", ${speed0}, ${speed1})\n`
  return code
}