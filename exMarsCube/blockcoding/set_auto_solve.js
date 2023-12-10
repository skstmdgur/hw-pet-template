javascriptGenerator.forBlock['exmarscube_set_auto_solve'] = function(block) {
  const code = `await makerKit.hw.run(routineContext, "exMarsCube.setAutoSolveCube");\n`
  return code;
};