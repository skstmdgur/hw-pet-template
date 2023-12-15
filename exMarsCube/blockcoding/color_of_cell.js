javascriptGenerator.forBlock['exmarscube_color_of_cell'] = function(block) {
  var faces = block.getFieldValue('FACES');
  var cells = block.getFieldValue('CELLS');
  const code = `await makerKit.hw.run(routineContext, "exMarsCube.getCellColor", ${faces}, ${cells});\n`
  return [code, Order.AWAIT];
};