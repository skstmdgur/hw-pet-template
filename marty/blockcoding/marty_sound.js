javascriptGenerator['marty_sound'] = function (block) {
  const action = block.getFieldValue('ACTION')

  const SOUNDS = {
    SOUND1: 'completed_tone_low_br.mp3',
    SOUND2: 'test440ToneQuietShort.mp3',
    SOUND3: 'unplgivy.mp3',
  }

  const soundFile = SOUNDS[action]
  if (!soundFile) {
    return "console.log('unknown sound action:' + action);\n"
  }

  return `await makerKit.hw.run(routineContext, 'marty.streamSoundFile','${soundFile}');\n`
}
