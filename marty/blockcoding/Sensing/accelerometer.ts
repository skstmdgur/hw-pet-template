javascriptGenerator['marty_accelerometer'] = function(block) {
    var axis = block.getFieldValue('AXIS');
    const code = `await makerKit.hw.run(routineContext, "marty.accelerometer", "${axis}");\n`;
    return [code, javascriptGenerator.ORDER_AWAIT];
  };