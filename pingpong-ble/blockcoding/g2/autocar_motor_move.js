javascriptGenerator.forBlock['oz71_autocar_move'] = function (block, generator) {
  const number_distance = block.getFieldValue('DISTANCE')
  const code = `await makerKit.hw.run(routineContext, "pingpong.moveAutoCar", ${50}, ${number_distance})`
  return code
}
