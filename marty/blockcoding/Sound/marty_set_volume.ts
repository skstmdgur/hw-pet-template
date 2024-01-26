javascriptGenerator.forBlock['marty_set_volume'] = function(block) {
  var volume = block.getFieldValue('volume');
  const code = `await makerKit.hw.run(routineContext, "marty.set_volume", ${volume});\n`
  return code;
};