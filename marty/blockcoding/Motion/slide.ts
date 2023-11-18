javascriptGenerator['marty_slide'] = function (block) {
  const times = block.getFieldValue('TIMES')
  const side = block.getFieldValue('SIDE')
  const code = `await makerKit.hw.run(routineContext, "marty.slide", ${times}, ${side});\n`
  return code
}
