javascriptGenerator.forBlock['oz71_g1_sensor_getsound'] = function (block, generator) {
  const code = `await makerKit.hw.run(routineContext, 'pingpong.getSoundSensor')`
  return [code, Order.NONE]
}
