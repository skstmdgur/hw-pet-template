javascriptGenerator.forBlock['oz71_g2_motor_stop'] = function (block, generator) {
  const code = `await makerKit.hw.run(routineContext, "pingpong.setMotorStop");\n`
  return code
}
