javascriptGenerator.forBlock['oz71_autocar_motor_turn'] = function (block, generator) {
  const number_speed = block.getFieldValue('SPEED')
  const dropdown_direction = block.getFieldValue('DIRECTION')
  const angle_name = block.getFieldValue('NAME')

  let speed = 50

  if (dropdown_direction === 'left') {
    speed = number_speed * -1
  }

  const code = `await makerKit.hw.run(routineContext, "pingpong.turnAutoCar", ${speed}, ${angle})`
  return code
}
