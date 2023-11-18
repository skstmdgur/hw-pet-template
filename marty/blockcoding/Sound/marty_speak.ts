javascriptGenerator['marty_marty_speak'] = function (block) {
  var text = block.getFieldValue('TEXT')
  var voice = block.getFieldValue('VOICE')
  var accent = block.getFieldValue('ACCENT')
  const code = `await makerKit.hw.run(routineContext, "marty.marty_speak", "${text}", "${voice}", "${accent}");\n`
  return code
}
