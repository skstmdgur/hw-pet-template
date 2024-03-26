javascriptGenerator.forBlock['oz71_g2_music_rest'] = function (block, generator) {
  const dropdown_cube = block.getFieldValue('CUBE')
  const dropdown_duration = block.getFieldValue('DURATION')

  const code = `await makerKit.hw.run(routineContext, "pingpong.sendMusic", ${dropdown_cube}, ${'"rest"'}, ${'"Do_6"'}, ${dropdown_duration})\n`
  return code
}
