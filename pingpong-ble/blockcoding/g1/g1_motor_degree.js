javascriptGenerator.forBlock['oz71_g1_motor_degree'] = function(block, generator) {
  const dropdown_direction = block.getFieldValue('DIRECTION');
  const number_speed = block.getFieldValue('SPEED');
  const angle_angle = block.getFieldValue('ANGLE');
  let speed = number_speed;

  if (dropdown_direction === 'left') {
    speed = number_speed * -1
  }

  const code = `await makerKit.hw.run(routineContext, "pingpong.setMotorDegree", ${speed}, ${angle_angle})`
  return code
};