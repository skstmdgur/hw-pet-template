javascriptGenerator.forBlock['exmarscube_init_all_colors'] = function(block) {
  const code = `await makerKit.hw.run(routineContext, "exMarsCube.setResetAllFace");\n`
  return code;
};