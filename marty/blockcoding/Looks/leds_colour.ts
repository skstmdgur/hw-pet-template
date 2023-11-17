javascriptGenerator['marty_leds_colour'] = function(block) {
    var LEDAddon = block.getFieldValue('LEDADDON');
    var colour = block.getFieldValue('COLOUR');
    const code = `await makerKit.hw.run(routineContext, "marty.leds_colour", "${LEDAddon}", "${colour}");\n`;
    return code;
  };
