javascriptGenerator.forBlock['pingpong2_g2_music_note'] = function (block, generator) {
  const dropdown_cube = block.getFieldValue('CUBE')
  const dropdown_duration = block.getFieldValue('DURATION')
  const dropdown_pianokey = block.getFieldValue('PIANOKEY')

  const code = `await makerKit.hw.run(routineContext, "pingpong.sendMusic", ${dropdown_cube}, ${'"note"'}, ${dropdown_pianokey}, ${dropdown_duration})\n`
  return code
}
