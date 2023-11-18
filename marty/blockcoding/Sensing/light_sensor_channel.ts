javascriptGenerator['marty_light_sensor_channel'] = function (block) {
  var channel = block.getFieldValue('CHANNEL')
  const code = `await makerKit.hw.run(routineContext, "marty.light_sensor_channel", "${channel}");\n`
  return [code, javascriptGenerator.ORDER_AWAIT]
}
