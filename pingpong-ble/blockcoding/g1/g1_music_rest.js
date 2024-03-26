javascriptGenerator.forBlock['oz71_g1_music_rest'] = function (block, generator) {
  const dropdown_duration = block.getFieldValue('DURATION')

  const code = `await makerKit.hw.run(routineContext, "pingpong.sendMusic", ${7}, ${'"rest"'}, ${'"Do_6"'}, ${dropdown_duration})\n`
  return code
}
