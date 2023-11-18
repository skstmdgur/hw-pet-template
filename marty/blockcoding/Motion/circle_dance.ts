javascriptGenerator['marty_circle_dance'] = function (block) {
  const side = block.getFieldValue('SIDE')
  const time = block.getFieldValue('TIME')
  const code = `await makerKit.hw.run(routineContext, "marty.circle_dance", ${time}, ${side});\n`
  return code
}
