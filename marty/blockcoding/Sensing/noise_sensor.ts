javascriptGenerator['marty_noise_sensor'] = function (block) {
  const code = `await makerKit.hw.run(routineContext, "marty.noise_sensor")`
  return [code, ORDER.AWAIT]
}
