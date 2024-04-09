javascriptGenerator.forBlock['oz71_g1_sensor_getfacetiltangle'] = function (block, generator) {
  const dropdown_tilt = block.getFieldValue('TILT')
  const code = `await makerKit.hw.run(routineContext, 'pingpong.getFaceTiltAngle', ${dropdown_tilt})\n`

  return [code, Order.NONE]
}
