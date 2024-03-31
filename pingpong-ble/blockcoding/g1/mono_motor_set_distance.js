javascriptGenerator.forBlock['pingpong1_mono_motor_setdistance'] = function (block, generator) {
  const value_speed = generator.valueToCode(block, 'SPEED', Order.ATOMIC)
  const value_distance = generator.valueToCode(block, 'DISTANCE', Order.ATOMIC)
  const dropdown_direction = block.getFieldValue('DIRECTION')

  let sps = 0

  if (dropdown_direction === 'back') {
    sps = 65536 - (Math.abs(value_speed) * 1100 - 10000) / Math.abs(value_speed)
  } else {
    sps = (value_speed * 1100 - 10000) / value_speed
  }

  const code = `await makerKit.hw.run(routineContext, "pingpong.setDistance", ${sps}, ${value_distance})\n`
  return code
}
