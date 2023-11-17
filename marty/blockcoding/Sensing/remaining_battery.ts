javascriptGenerator['marty_remaining_battery'] = function(block) {
    const code = `await makerKit.hw.run(routineContext, "marty.remaining_battery");\n`;
    return [code, javascriptGenerator.ORDER_AWAIT];
  };