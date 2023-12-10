javascriptGenerator.forBlock['exmarscube_set_playmode'] = function(block) {
  var pitch = block.getFieldValue('PITCH');
  const code = `await makerKit.hw.run(routineContext, "exMarsCube.setPlayMode", ${pitch});\n`
  return code;
};