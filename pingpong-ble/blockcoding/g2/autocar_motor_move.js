javascriptGenerator.forBlock['pingpong2_autocar_motor_move'] = function (block, generator) {
  const value_speed = generator.valueToCode(block, 'SPEED', Order.ATOMIC)
  const value_distance = generator.valueToCode(block, 'DISTANCE', Order.ATOMIC)
  const dropdown_direction = block.getFieldValue('DIRECTION')

  let speed = value_speed

  if (dropdown_direction === 'back') {
    speed = speed * -1
  }

  const code = `await makerKit.hw.run(routineContext, "pingpong.moveAutoCar", ${speed}, ${value_distance});\n`
  return code
}
