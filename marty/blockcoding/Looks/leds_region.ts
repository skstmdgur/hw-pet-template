javascriptGenerator['marty_leds_region'] = function (block) {
  var LEDAddon = block.getFieldValue('LEDADDON')
  var region = block.getFieldValue('REGION')
  var colour = block.getFieldValue('COLOUR')
  const code = `await makerKit.hw.run(routineContext, "marty.leds_region", "${LEDAddon}", "${region}", "${colour}");\n`
  return code
}
