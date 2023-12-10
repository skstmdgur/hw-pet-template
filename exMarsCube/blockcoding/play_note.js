javascriptGenerator.forBlock['exmarscube_play_note'] = function(block) {
  var pitch = block.getFieldValue('PITCH');
  var time = javascriptGenerator.valueToCode(block, 'TIME', Order.ATOMIC);
  const code = `await makerKit.hw.run(routineContext, "exMarsCube.setPlayNote", ${pitch}, ${time});\n`
  return code;
};