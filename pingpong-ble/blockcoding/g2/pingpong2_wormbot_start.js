javascriptGenerator.forBlock['pingpong2_wormbot_start'] = function (block, generator) {
  const code = `await makerKit.hw.run(routineContext, "pingpong.sendStart");\n`
  return code
}
