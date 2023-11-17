javascriptGenerator['marty_colour_sensor_channel'] = function(block) {
  var channel = block.getFieldValue('CHANNEL');
    const code = `await makerKit.hw.run(routineContext, "marty.colour_sensor_channel", "${channel}");\n`;
    return [code, javascriptGenerator.ORDER_AWAIT];
  };