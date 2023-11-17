javascriptGenerator['marty_leds_pattern'] = function(block) {
    var LEDAddon = block.getFieldValue('LEDADDON');
    var pattern = block.getFieldValue('PATTERN');
    const code = `await makerKit.hw.run(routineContext, "marty.leds_pattern", "${LEDAddon}", "${pattern}");\n`;
    return code;
  };
