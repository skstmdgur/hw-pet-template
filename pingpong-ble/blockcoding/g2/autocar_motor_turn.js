javascriptGenerator.forBlock['oz71_autocar_motor_turn'] = function (block, generator) {
  const number_speed = block.getFieldValue('SPEED')
  const dropdown_direction = block.getFieldValue('DIRECTION')
  const angle_degree = block.getFieldValue('DEGREE')

  let speed = number_speed

  if (dropdown_direction === 'right') {
    speed = speed * -1
  }

  const code = `await makerKit.hw.run(routineContext, "pingpong.turnAutoCar", ${speed}, ${angle_degree});\n`
  return code
}
