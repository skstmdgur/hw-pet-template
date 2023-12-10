javascriptGenerator.forBlock['exmarscube_value_of_rotation'] = function(block) {
  var faces = block.getFieldValue('FACES');
  const code = `await makerKit.hw.run(routineContext, "exMarsCube.getFaceRotationValue", ${faces});\n`
  return [code, Order.AWAIT];
};