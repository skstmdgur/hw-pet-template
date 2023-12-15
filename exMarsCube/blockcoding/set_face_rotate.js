javascriptGenerator.forBlock['exmarscube_set_face_rotate'] = function(block) {
  var faces = block.getFieldValue('FACES');
  var direction = block.getFieldValue('DIRECTION');
  var angle = block.getFieldValue('ANGLE');
  const code = `await makerKit.hw.run(routineContext, "exMarsCube.setFaceRotation", ${faces}, ${direction}, ${angle});\n`
  return code;
};