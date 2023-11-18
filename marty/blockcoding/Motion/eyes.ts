javascriptGenerator['marty_eyes'] = function (block) {
  const eyeCommand = block.getFieldValue('COMMAND')
  const code = `await makerKit.hw.run(routineContext, "marty.eyes", ${eyeCommand});\n`
  return code
}
