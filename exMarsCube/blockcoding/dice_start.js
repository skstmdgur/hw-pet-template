javascriptGenerator.forBlock['exmarscube_dice_start'] = function (block) {
  var value_dice = javascriptGenerator.valueToCode(block, 'DICE', Order.ATOMIC);
  const code = `await makerKit.hw.run(routineContext, "exMarsCube.setDiceStart", ${value_dice});\n`
  return code;
};