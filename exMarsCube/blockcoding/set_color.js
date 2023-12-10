javascriptGenerator.forBlock['exmarscube_set_colors'] = function (block) {
  var faces = block.getFieldValue('FACES');
  var colors1 = block.getFieldValue('COLORS1');
  var colors2 = block.getFieldValue('COLORS2');
  var colors3 = block.getFieldValue('COLORS3');
  var colors4 = block.getFieldValue('COLORS4');
  var colors5 = block.getFieldValue('COLORS5');
  var colors6 = block.getFieldValue('COLORS6');
  var colors7 = block.getFieldValue('COLORS7');
  var colors8 = block.getFieldValue('COLORS8');
  const code = `await makerKit.hw.run(routineContext, "exMarsCube.setCellColorChange", ${faces}, ${colors1}, ${colors2}, ${colors3}, ${colors4}, ${colors5}, ${colors6}, ${colors7}, ${colors8});\n`
  return code;
};