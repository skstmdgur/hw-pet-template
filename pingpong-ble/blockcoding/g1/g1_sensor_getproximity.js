javascriptGenerator.forBlock['oz71_g1_sensor_getproximity'] = function (block, generator) {
  const code = `await makerKit.hw.run(routineContext, 'pingpong.getProximitySensor')\n`
  return [code, Order.NONE]
}
