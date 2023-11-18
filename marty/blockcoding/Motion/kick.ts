javascriptGenerator['marty_kick'] = function (block) {
  const side = block.getFieldValue('SIDE')
  const code = `await makerKit.hw.run(routineContext, "marty.kick", ${side});\n`
  return code
}
