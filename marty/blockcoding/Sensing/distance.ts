javascriptGenerator['marty_distance'] = function (block) {
  const code = `await makerKit.hw.run(routineContext, "marty.distance")`
  return [code, ORDER.AWAIT]
}
