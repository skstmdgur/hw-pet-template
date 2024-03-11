// just holding some code to test the blocks in the iframe playground
hw.dance();
hw.get_ready();
hw.wiggle();
hw.circle_dance(time, side);
hw.eyes(eyeCommand);
hw.kick(side);
hw.hold(time);
hw.lean(time, side);
hw.lift_foot(side);
hw.lower_foot(side);
hw.move_joint(time, joint, angle);
hw.slide(times, side);
hw.stand_straight(time);
hw.turn(steps, side);
hw.walk(steps, side);
hw.walk_expanded(steps, stepLength, time, angle);
hw.wave(side);
hw.function_led_set(hexColour);
hw.function_led_set_ms(hexColour, timeInMs);
hw.function_led_off();
hw.leds_pattern(LEDAddon, pattern);
hw.leds_colour(LEDAddon, colour);
hw.leds_region(LEDAddon, region, colour);
hw.leds_specific_led(LEDAddon, ledId, colour);
hw.play_sound(soundName);
hw.start_sound(soundName);
hw.stop_all_sounds();
hw.marty_speak(text, voice, accent); // hw.marty_speak("hello", "Alto", "en");
hw.accelerometer(axis);
hw.remaining_battery();
hw.current(joint);
hw.position(joint);
hw.distance(); // @param sensor - color or distance or IRF (obstacle)
hw.foot_on_ground(); // @param sensor - color or obstacle (IRF)
hw.foot_obstacle(); // @param sensor - color or obstacle (IRF)
hw.colour_sensor();
hw.colour_sensor_channel(channel);
hw.noise_sensor();
hw.light_sensor_channel(channel);
hw.set_volume(100);
hw.change_volume_by(10);