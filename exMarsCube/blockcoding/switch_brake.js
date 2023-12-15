javascriptGenerator.forBlock['exmarscube_switch_brake'] = function(block) {
  var brake = block.getFieldValue('SWITCH');
  const code = `await makerKit.hw.run(routineContext, "exMarsCube.setNonBrake", ${brake});\n`
  return code;
};