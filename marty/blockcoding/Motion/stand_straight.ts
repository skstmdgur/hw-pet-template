javascriptGenerator['marty_stand_straight'] = function(block) {
    const time = javascriptGenerator.valueToCode(block, 'TIME', javascriptGenerator.ORDER_ATOMIC);
    const code = `await makerKit.hw.run(routineContext, "marty.stand_straight", ${time});\n`;
    return code;
  };