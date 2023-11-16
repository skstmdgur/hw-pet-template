javascriptGenerator['marty_pwrctrl_5v'] = function (block) {
  const isOn = block.getFieldValue('ACTION') === 'ON';
  const cmd = isOn ? 'pwrctrl/5von' : 'pwrctrl/5voff';
  return `await makerKit.hw.run(routineContext, 'marty.sendREST','${cmd}');\n`
};
