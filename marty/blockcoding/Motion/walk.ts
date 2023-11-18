javascriptGenerator['marty_walk'] = function (block) {
  var steps = block.getFieldValue('STEPS')
  var side = block.getFieldValue('SIDE')
  const code = `await makerKit.hw.run(routineContext, "marty.walk", ${steps}, ${side});\n`
  return code
}
