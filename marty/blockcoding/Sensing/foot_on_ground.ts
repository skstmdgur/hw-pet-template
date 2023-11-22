javascriptGenerator['marty_foot_on_ground'] = function (block) {
  const code = `await makerKit.hw.run(routineContext, "marty.foot_on_ground")`
  return [code, ORDER.AWAIT]
}
