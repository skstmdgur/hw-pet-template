javascriptGenerator.forBlock['exmarscube_init_rotation'] = function (block) {
  const code = `await makerKit.hw.run(routineContext, "exMarsCube.setResetRotation");\n`
  return code;
};
