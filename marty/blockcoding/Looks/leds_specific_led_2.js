javascriptGenerator.forBlock['marty_leds_specific_led_test'] = function(block) {
  var LEDAddon = block.getFieldValue('LEDADDON');
  var ledId = javascriptGenerator.valueToCode(block, 'LEDID', Order.ATOMIC);
  var colour = block.getFieldValue('COLOUR');
  const code = `await makerKit.hw.run(routineContext, "marty.leds_specific_led", "${LEDAddon}", "${ledId}", "${colour}");\n`;
  return code;
};