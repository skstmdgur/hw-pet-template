javascriptGenerator['marty_noise_sensor'] = function (block) {
  const code = `await makerKit.hw.run(routineContext, "marty.noise_sensor");\n`
  return [code, javascriptGenerator.ORDER_AWAIT]
}
