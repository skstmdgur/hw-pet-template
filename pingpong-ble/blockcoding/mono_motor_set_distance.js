javascriptGenerator.forBlock['oz71_setdistance'] = function (block, generator) {
  const number_distance = block.getFieldValue('DISTANCE')
  const code = `await makerKit.hw.run(routineContext, "pingpong.setDistance", ${number_distance});\n`
  return code
}
