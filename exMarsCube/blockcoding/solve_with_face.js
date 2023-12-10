javascriptGenerator.forBlock['exmarscube_solve_with_face'] = function(block) {
  var faces = block.getFieldValue('FACES');
  var relatived_direction = block.getFieldValue('RELATIVED_DIRECTION');
  var time = javascriptGenerator.valueToCode(block, 'TIME', Order.ATOMIC);
  const code = `await makerKit.hw.run(routineContext, "exMarsCube.setSolveCube", ${faces}, ${relatived_direction}, ${time});\n`
  return code;
};