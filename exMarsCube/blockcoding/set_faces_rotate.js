javascriptGenerator.forBlock['exmarscube_set_faces_rotate'] = function (block) {
  var faces1 = block.getFieldValue('FACES1');
  var direction1 = block.getFieldValue('DIRECTION1');
  var angle1 = block.getFieldValue('ANGLE1');
  var faces2 = block.getFieldValue('FACES2');
  var direction2 = block.getFieldValue('DIRECTION2');
  var angle2 = block.getFieldValue('ANGLE2');
  const code = `await makerKit.hw.run(routineContext, "exMarsCube.setFacesRotation", ${faces1}, ${direction1}, ${angle1}, ${faces2}, ${direction2}, ${angle2});\n`
  return code
};
  