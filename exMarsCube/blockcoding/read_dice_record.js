javascriptGenerator.forBlock['exmarscube_read_dice_record'] = function(block) {
  const code = `await makerKit.hw.run(routineContext, "exMarsCube.setReturnDiceNumberRecord");\n`
  return code;
};