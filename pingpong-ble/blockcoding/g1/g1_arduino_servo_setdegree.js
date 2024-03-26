javascriptGenerator.forBlock['oz71_g1_arduino_servo_setdegree'] = function (block) {
  const number_distance = block.getFieldValue('DISTANCE')
  const code = `await makerKit.hw.run(routineContext, "pingpong.setServoDegree", ${7}, ${number_distance});\n`
  return code
}
