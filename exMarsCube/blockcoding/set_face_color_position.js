javascriptGenerator.forBlock['exmarscube_set_face_color_postion'] = function(block) {
  var faces = block.getFieldValue('FACES');
  var direction = block.getFieldValue('DIRECTION');
  var angle = block.getFieldValue('ANGLE');
  const code = `await makerKit.hw.run(routineContext, "exMarsCube.setFaceRotationOnlyColor", ${faces}, ${direction}, ${angle});\n`
  return code;
};