javascriptGenerator['marty_walk_expanded'] = function (block) {
  var steps = block.getFieldValue('STEPS')
  var stepLength = block.getFieldValue('STEP_LENGTH')
  var time = block.getFieldValue('TIME')
  var angle = block.getFieldValue('ANGLE')
  const code = `await makerKit.hw.run(routineContext, "marty.walk_expanded", ${steps}, ${stepLength}, ${time}, ${angle});\n`
  return code
}
