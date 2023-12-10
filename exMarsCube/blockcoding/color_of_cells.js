javascriptGenerator.forBlock['exmarscube_color_of_cells'] = function(block) {
  var faces = block.getFieldValue('FACES');
  const code = `await makerKit.hw.run(routineContext, "exMarsCube.getFaceColor", ${faces});\n`
  return [code, Order.AWAIT];
};