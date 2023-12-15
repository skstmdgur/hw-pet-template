javascriptGenerator.forBlock['exmarscube_record_about_mode'] = function(block) {
  var modes = block.getFieldValue('MODES');
  var recodes = block.getFieldValue('RECODES');
  const code = `await makerKit.hw.run(routineContext, "exMarsCube.getModeRecord", ${modes}, ${recodes});\n`
  return [code, Order.AWAIT];
};