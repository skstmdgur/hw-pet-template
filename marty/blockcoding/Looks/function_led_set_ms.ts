javascriptGenerator['marty_function_led_set_ms'] = function(block) {
    var hex_colour = block.getFieldValue('COLOUR');
    var timeInMs = block.getFieldValue('TIME');
    const code = `await makerKit.hw.run(routineContext, "marty.function_led_set_ms", ${hex_colour}, ${timeInMs});\n`;
    return code;
  };