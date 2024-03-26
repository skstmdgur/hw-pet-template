javascriptGenerator.forBlock['oz71_mono_motor_setdistance'] = function (block, generator) {
  const number_speed = block.getFieldValue('SPEED')
  const number_distance = block.getFieldValue('DISTANCE')
  const dropdown_direction = block.getFieldValue('DIRECTION')

  let sps = 0

  if (dropdown_direction === 'back') {
    sps = 65536 - (Math.abs(number_speed) * 1100 - 10000) / Math.abs(number_speed)
  } else {
    sps = (number_speed * 1100 - 10000) / number_speed
  }

  const code = `await makerKit.hw.run(routineContext, "pingpong.setDistance", ${sps}, ${number_distance})\n`
  return code
}
