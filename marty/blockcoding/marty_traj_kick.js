javascriptGenerator['marty_traj_kick'] = function (block) {
  return "await makerKit.hw.run(routineContext, 'marty.sendREST','traj/kick', null, 3000);\n"
};
