javascriptGenerator.forBlock['oz71_g1_music_note'] = function (block, generator) {
  const dropdown_duration = block.getFieldValue('DURATION')
  const dropdown_pianokey = block.getFieldValue('PIANOKEY')

  const code = `await makerKit.hw.run(routineContext, "pingpong.sendMusic", ${7}, ${'"note"'}, ${dropdown_pianokey}, ${dropdown_duration})\n`
  return code
}
