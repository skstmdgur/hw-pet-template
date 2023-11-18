javascriptGenerator['marty_foot_obstacle'] = function (block) {
  const code = `await makerKit.hw.run(routineContext, "marty.foot_obstacle");\n`
  return [code, javascriptGenerator.ORDER_AWAIT]
}
