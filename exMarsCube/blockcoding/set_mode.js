javascriptGenerator.forBlock['exmarscube_set_mode'] = function(block) {
  var main = block.getFieldValue('MAIN');
  var sub = block.getFieldValue('SUB');
  const code = `await makerKit.hw.run(routineContext, "exMarsCube.setModeSetting", ${main}, ${sub});\n`
  return code;
};