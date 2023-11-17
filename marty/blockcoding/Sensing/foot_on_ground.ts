javascriptGenerator['marty_foot_on_ground'] = function(block) {
    const code = `await makerKit.hw.run(routineContext, "marty.foot_on_ground");\n`;
    return [code, javascriptGenerator.ORDER_AWAIT];
  };