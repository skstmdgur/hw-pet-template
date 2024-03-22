javascriptGenerator.forBlock['oz71_g1_motor_stop'] = function(block, generator) {
    const code = `await makerKit.hw.run(routineContext, "pingpong.setMotorStop")`
    return code
  };