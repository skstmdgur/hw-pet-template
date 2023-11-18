javascriptGenerator['marty_lower_foot'] = function (block) {
  const side = block.getFieldValue('SIDE')
  const code = `await makerKit.hw.run(routineContext, "marty.lower_foot", ${side});\n`
  return code
}
