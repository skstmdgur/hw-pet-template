javascriptGenerator.forBlock['oz71_autocar_motor_stop'] = function (block, generator) {
  const dropdown_cube = block.getFieldValue('CUBE')

  let code = `await makerKit.hw.run(routineContext, "pingpong.setMotorStop");\n`
  if (dropdown_cube === 0) {
    code = `await makerKit.hw.run(routineContext, "pingpong.sendContinuousStep", ${2}, ${0}, ${0});\n`
  } else if (dropdown_cube === 1) {
    code = `await makerKit.hw.run(routineContext, "pingpong.sendContinuousStep", ${2}, ${1}, ${0});\n`
  } else if (dropdown_cube === 8) {
    code = `await makerKit.hw.run(routineContext, "pingpong.setMotorStop");\n`
  }

  return code
}
