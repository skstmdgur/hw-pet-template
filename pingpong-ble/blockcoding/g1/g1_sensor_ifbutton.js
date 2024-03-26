javascriptGenerator.forBlock['oz71_g1_sensor_ifbutton'] = function (block, generator) {
  const code = `await makerKit.hw.run(routineContext, 'pingpong.ifButtonSensor')\n`
  return [code, Order.NONE]
}
