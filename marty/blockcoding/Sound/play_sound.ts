javascriptGenerator['marty_play_sound'] = function (block) {
  var sound_name = block.getFieldValue('SOUND')
  const code = `await makerKit.hw.run(routineContext, "marty.play_sound", "${sound_name}");\n`
  return code
}
