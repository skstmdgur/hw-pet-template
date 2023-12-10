javascriptGenerator.forBlock['exmarscube_modestate'] = function(block) {
  const code = `await makerKit.hw.run(routineContext, "exMarsCube.getModeStatus");\n`
  return [code, Order.AWAIT];
};