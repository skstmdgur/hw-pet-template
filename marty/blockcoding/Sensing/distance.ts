javascriptGenerator['marty_distance'] = function (block) {
  const code = `await makerKit.hw.run(routineContext, "marty.distance");\n`
  return [code, javascriptGenerator.ORDER_AWAIT]
}
