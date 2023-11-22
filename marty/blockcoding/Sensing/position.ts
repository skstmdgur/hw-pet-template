javascriptGenerator['marty_position'] = function (block) {
  var joint = block.getFieldValue('JOINT')
  const code = `await makerKit.hw.run(routineContext, "marty.position", "${joint}")`
  return [code, ORDER.AWAIT]
}
