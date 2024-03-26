javascriptGenerator.forBlock['oz71_autocar_motor_move'] = function (block, generator) {
  const number_speed = block.getFieldValue('SPEED')
  const number_distance = block.getFieldValue('DISTANCE')
  const dropdown_direction = block.getFieldValue('DIRECTION')

  let speed = number_speed

  if (dropdown_direction === 'back') {
    speed = speed * -1
  }

  const code = `await makerKit.hw.run(routineContext, "pingpong.moveAutoCar", ${speed}, ${number_distance});\n`
  return code
}
