javascriptGenerator['marty_accelerometer'] = function (block) {
  var axis = block.getFieldValue('AXIS')
  const code = `await makerKit.hw.run(routineContext, "marty.accelerometer", "${axis}")`
  return [code, ORDER.AWAIT]
}
