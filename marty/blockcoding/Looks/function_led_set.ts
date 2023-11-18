javascriptGenerator['marty_function_led_set'] = function (block) {
  var hex_colour = block.getFieldValue('COLOUR')
  const code = `await makerKit.hw.run(routineContext, "marty.function_led_set", ${hex_colour});\n`
  return code
}
