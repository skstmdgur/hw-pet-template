javascriptGenerator.forBlock['exmarscube_set_face_state'] = function(block) {
  var faces = block.getFieldValue('FACES');
  var position = javascriptGenerator.valueToCode(block, 'POSITION', Order.ATOMIC);
  var direction = block.getFieldValue('DIRECTION');
  var torque = block.getFieldValue('TORQUE');
  const code = `await makerKit.hw.run(routineContext, "exMarsCube.setPositionDirectionTorqueChange", ${faces}, ${position}, ${direction}, ${torque});\n`
  return code;
};