javascriptGenerator.forBlock['exmarscube_set_usermode'] = function(block) {
  var dropdown_users = block.getFieldValue('USERS');
  const code = `await makerKit.hw.run(routineContext, "exMarsCube.setUserMode", ${dropdown_users});\n`
  return code;
};