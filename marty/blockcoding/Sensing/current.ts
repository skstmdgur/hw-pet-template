javascriptGenerator['marty_current'] = function(block) {
    var joint = block.getFieldValue('JOINT');
    const code = `await makerKit.hw.run(routineContext, "marty.current", "${joint}");\n`;
    return [code, javascriptGenerator.ORDER_AWAIT];
  };