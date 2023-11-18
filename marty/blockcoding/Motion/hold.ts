javascriptGenerator['marty_hold'] = function (block) {
  const time = block.getFieldValue('TIME')
  const code = `await makerKit.hw.run(routineContext, "marty.hold", ${time});\n`
  return code
}
