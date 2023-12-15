javascriptGenerator.forBlock['exmarscube_dice_record'] = function(block) {
  var recode_dice = block.getFieldValue('RECODE_DICE');
  const code = `await makerKit.hw.run(routineContext, "exMarsCube.getDiceNumberRecord", ${recode_dice});\n`
  return [code, Order.AWAIT];
};