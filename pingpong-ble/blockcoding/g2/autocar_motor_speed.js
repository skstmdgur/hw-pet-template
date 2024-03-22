javascriptGenerator.forBlock['oz71_autocar_speed'] = function (block, generator) {
  const dropdown_direction = block.getFieldValue('DIRECTION')
  const number_speed = block.getFieldValue('ANGLE')
  let speed = number_speed

  if (dropdown_direction === 'back') {
    speed = number_angle * -1
  }

  const code = `await makerKit.hw.run(routineContext, "pingpong.sendAggregator", ${2}, ${0}, ${speed}, ${0}, ${speed * -1}, ${0})`
  return code
}
