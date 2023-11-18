javascriptGenerator['marty_start_sound'] = function (block) {
  var sound_name = block.getFieldValue('SOUND')
  const code = `await makerKit.hw.run(routineContext, "marty.start_sound", "${sound_name}");\n`
  return code
}
