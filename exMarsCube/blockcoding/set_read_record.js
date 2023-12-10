javascriptGenerator.forBlock['exmarscube_set_read_record'] = function(block) {
  var modes = block.getFieldValue('MODES');
  const code = `await makerKit.hw.run(routineContext, "exMarsCube.setReturnModeRecord", ${modes});\n`
  return code;
};