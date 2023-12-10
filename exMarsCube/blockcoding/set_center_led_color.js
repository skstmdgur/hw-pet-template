javascriptGenerator.forBlock['exmarscube_set_center_led_color'] = function (block) {
  var faces = block.getFieldValue('FACES');
  var colors = block.getFieldValue('COLORS');
  const code = `await makerKit.hw.run(routineContext, "exMarsCube.setCenterColorChange", ${faces}, ${colors});\n`
  return code;
};
