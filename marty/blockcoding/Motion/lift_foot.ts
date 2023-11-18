javascriptGenerator['marty_lift_foot'] = function (block) {
  const side = block.getFieldValue('SIDE')
  const code = `await makerKit.hw.run(routineContext, "marty.lift_foot", ${side});\n`
  return code
}
