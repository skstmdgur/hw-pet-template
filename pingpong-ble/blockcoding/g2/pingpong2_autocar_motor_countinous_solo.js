javascriptGenerator.forBlock['pingpong2_autocar_motor_countinous_solo'] = function(block, generator) {
  const dropdown_cube = block.getFieldValue('CUBE');
  const dropdown_direction = block.getFieldValue('DIRECTION');
  const value_speed = generator.valueToCode(block, 'SPEED', Order.ATOMIC);
  
  let speed0 = value_speed
  let speed1 = value_speed
  let code = `await makerKit.hw.run(routineContext, "pingpong.setMotorStop");\n`

  if (dropdown_cube === "left") {
    if (dropdown_direction === "front") {
      speed0 = 65536 - (speed0 * 1100 - 10000) / speed0
    } else {
      speed0 = (speed0 * 1100 - 10000) / speed0
    }

    code = `await makerKit.hw.run(routineContext, "pingpong.sendContinuousStep", ${2}, ${0}, ${speed0});\n`
  } else if (dropdown_cube === "right") {
    if (dropdown_direction === "back") {
      speed1 = 65536 - ((speed1 * 1100 - 10000) / speed1)
    } else {
      speed1 = (speed1 * 1100 - 10000) / speed1
    }

    code = `await makerKit.hw.run(routineContext, "pingpong.sendContinuousStep", ${2}, ${1}, ${speed1});\n`
  } else if (dropdown_cube === "all") {
      if (dropdown_direction === "front") {
        speed0 = value_speed * -1
      } else if (dropdown_direction === "back") {
        speed1 = value_speed * -1
      }
    code = `await makerKit.hw.run(routineContext, "pingpong.setMotorContinuous", ${speed0}, ${speed1});\n`
  }

  return code
}