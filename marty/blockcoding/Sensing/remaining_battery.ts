javascriptGenerator['marty_remaining_battery'] = function (block) {
  const code = `await makerKit.hw.run(routineContext, "marty.remaining_battery")`
  return [code, ORDER.AWAIT]
}
