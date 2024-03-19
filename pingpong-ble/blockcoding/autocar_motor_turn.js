javascriptGenerator.forBlock['oz71_autocar_turn'] = function (block, generator) {
  const dropdown_direction = block.getFieldValue('DIRECTION')
  const number_angle = block.getFieldValue('ANGLE')
  let angle = number_angle

  if (dropdown_direction === 'left') {
    angle = number_angle * -1
  }

  const code = `await makerKit.hw.run(routineContext, "pingpong.turnAutoCar", ${50}, ${angle});\n`
  return code
}
