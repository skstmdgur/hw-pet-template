javascriptGenerator.forBlock['oz71_g1_sensor_ifuppertillt'] = function (block, generator) {
  const dropdown_tillt = block.getFieldValue('TILLT')
  const code = `await makerKit.hw.run(routineContext, 'pingpong.ifUpperTilt', ${dropdown_tillt})\n`
  return [code, Order.NONE]
}
