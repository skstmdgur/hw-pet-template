javascriptGenerator['marty_traj_eye'] = function (block) {
  const isWide = block.getFieldValue('ACTION') === 'WIDE';
  const cmd = isWide ? 'traj/eyesWide' : 'traj/eyesNormal';
  return `await makerKit.hw.run(routineContext, 'marty.sendREST','${cmd}', null, 1200);\n`
};
