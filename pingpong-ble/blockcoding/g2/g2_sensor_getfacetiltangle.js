javascriptGenerator.forBlock['oz71_g2_sensor_getfacetiltangle'] = function (block, generator) {
  const dropdown_cube = block.getFieldValue('CUBE')
  const dropdown_tilt = block.getFieldValue('TILT')

  const code = `await makerKit.hw.run(routineContext, 'pingpong.getFaceTiltAngle', ${dropdown_cube}, ${dropdown_tilt})\n`
  return [code, Order.NONE]
}
