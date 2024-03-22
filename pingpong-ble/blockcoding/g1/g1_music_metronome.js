javascriptGenerator.forBlock['oz71_g1_music_metronome'] = function (block, generator) {
  const dropdown_metronome = block.getFieldValue('METRONOME')
  const code = `await makerKit.hw.run(routineContext, "pingpong.setMusicMetronome", ${dropdown_metronome})`
  return code
}
