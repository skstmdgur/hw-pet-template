javascriptGenerator['marty_turn'] = function (block) {
  var steps = block.getFieldValue('STEPS')
  var side = block.getFieldValue('SIDE')
  const code = `await makerKit.hw.run(routineContext, "marty.turn", ${steps}, ${side});\n`
  return code
}
