javascriptGenerator.forBlock['exmarscube_read_cell_color'] = function (block) {
  const code = `await makerKit.hw.run(routineContext, "exMarsCube.getCellColor");\n`
  return code;
};