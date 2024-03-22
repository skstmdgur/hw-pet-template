javascriptGenerator.forBlock['oz71_set_distance'] = function (block, generator) {
  const dropdown_direction = block.getFieldValue('DIRECTION')
  const number_distance = block.getFieldValue('DISTANCE')
  let distance = number_distance

  if (dropdown_direction === 'back') {
    distance = number_distance * -1
  }

  const code = `await makerKit.hw.run(routineContext, "pingpong.setDistance", ${distance})`
  return code
}
