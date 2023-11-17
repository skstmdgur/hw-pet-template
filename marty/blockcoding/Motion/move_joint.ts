javascriptGenerator['marty_move_joint'] = function(block) {
  const joint = block.getFieldValue('JOINT');
  const angle = block.getFieldValue('ANGLE');
  const time = block.getFieldValue('TIME');
  const code = `await makerKit.hw.run(routineContext, "marty.move_joint", ${time}, ${joint}, ${angle});\n`;
  return code;
};