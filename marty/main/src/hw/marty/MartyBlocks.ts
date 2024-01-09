import AddonHelper from './helpers/AddonHelper'
import ColourHelper from './helpers/ColourHelper'
import SoundHelper from './helpers/SoundHelper'
import martyConnector from './MartyConnector'

const DEBUG = false
// window.martyConnector = martyConnector; //exposing for debugging
/**
 * Hardware Service: MartyRobotical
 */
export class MartyBlocks {
  public readonly NEEDS_VERIFICATION = true
  /**
   */
  dance = async (): Promise<void> => {
    const moveTime = 3000
    const command = `traj/dance/1?moveTime=${moveTime}`
    martyConnector.sendRestMessage(command)
    await new Promise((resolve) => setTimeout(resolve, moveTime))
  }

  /**
   */
  get_ready = async (): Promise<void> => {
    const moveTime = 3000
    const command = `traj/getReady/?moveTime=${moveTime}`
    martyConnector.sendRestMessage(command)
    await new Promise((resolve) => setTimeout(resolve, moveTime))
  }

  /**
   */
  wiggle = async (): Promise<void> => {
    const moveTime = 4000
    const command = `traj/wiggle/1/?moveTime=${moveTime}`
    martyConnector.sendRestMessage(command)
    await new Promise((resolve) => setTimeout(resolve, moveTime))
  }

  /**
   * @param time - Time in seconds
   * @param side - 0 = left or 1 = right
   */
  circle_dance = async (time: string, side: string): Promise<void> => {
    const timeInMs = parseFloat(time) * 1000
    const finalTime = Math.min(Math.max(timeInMs, 1), 10000)
    const command = `traj/circle/1/?moveTime=${finalTime}&side=${side}`
    martyConnector.sendRestMessage(command)
    await new Promise((resolve) => setTimeout(resolve, finalTime))
  }

  /**
   * @param eyeCommand - eyesExcited or eyesWide or eyesAngry or eyesNormal or wiggleEyes
   */
  eyes = async (eyeCommand: string): Promise<void> => {
    const command = `traj/${eyeCommand}`
    martyConnector.sendRestMessage(command)
    let moveTime = 1000
    if (eyeCommand === 'wiggleEyes') {
      moveTime = 2000
    }
    await new Promise((resolve) => setTimeout(resolve, moveTime))
  }

  /**
   * @param side - 0 = left or 1 = right
   */
  kick = async (side: string): Promise<void> => {
    const moveTime = 3000
    const command = `traj/kick/1/?moveTime=${moveTime}&side=${side}`
    martyConnector.sendRestMessage(command)
    await new Promise((resolve) => setTimeout(resolve, moveTime))
  }

  /**
   * @param time - Time in seconds
   */
  hold = async (time: string): Promise<void> => {
    const moveTime = Math.min(Math.max(parseFloat(time) * 1000, 1), 10000)
    const command = `traj/hold/?moveTime=${moveTime}`
    martyConnector.sendRestMessage(command)
    await new Promise((resolve) => setTimeout(resolve, moveTime))
  }

  /**
   * @param side - 0 = left or 1 = right or 2 = backward or 3 = forward
   * @param time - Time in seconds
   */
  lean = async (time: string, side: string): Promise<void> => {
    const timeInMs = parseFloat(time) * 1000
    const finalTime = Math.min(Math.max(timeInMs, 1), 10000)
    const command = `traj/lean/1/?moveTime=${finalTime}&side=${side}`
    martyConnector.sendRestMessage(command)
    await new Promise((resolve) => setTimeout(resolve, finalTime))
  }

  /**
   * @param side - 0 = left or 1 = right
   */
  lift_foot = async (side: string): Promise<void> => {
    const command = `traj/liftFoot/1/?side=${side}`
    martyConnector.sendRestMessage(command)
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  /**
   * @param side - 0 = left or 1 = right
   */
  lower_foot = async (side: string): Promise<void> => {
    const command = `traj/lowerFoot/1/?side=${side}`
    martyConnector.sendRestMessage(command)
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  /**
   * @param time - Time in seconds
   * @param joint - 0 = left hip or 1 = left twist or 2 = left knee or 3 = right hip or 4 = right twist or 5 = right knee or 6 = left arm or 7 = right arm or 8 = eyes
   * @param angle - Angle in degrees
   */
  move_joint = async (time: string, joint: string, angle: string): Promise<void> => {
    const timeInMs = parseFloat(time) * 1000
    const finalTime = Math.min(Math.max(timeInMs, 1), 10000)
    const command = `traj/joint/1/?moveTime=${finalTime}&jointID=${joint}&angle=${angle}`
    martyConnector.sendRestMessage(command)
    await new Promise((resolve) => setTimeout(resolve, finalTime))
  }

  /**
   * @param times - Number of times to slide
   * @param side - 0 = left or 1 = right
   */
  slide = async (times: string, side: string): Promise<void> => {
    const moveTime = 1000
    let steps = parseInt(times)
    if (steps === 0 || steps < 0 || steps > 20) {
      steps = 1
    }
    const command = `traj/sidestep/${steps}/?moveTime=${moveTime}&side=${side}`
    martyConnector.sendRestMessage(command)
    await new Promise((resolve) => setTimeout(resolve, moveTime * steps))
  }

  /**
   * @param time - Time in seconds
   */
  stand_straight = async (time: string): Promise<void> => {
    const moveTime = Math.min(Math.max(parseFloat(time) * 1000, 1), 10000)
    const command = `traj/standStraight/?moveTime=${moveTime}`
    martyConnector.sendRestMessage(command)
    await new Promise((resolve) => setTimeout(resolve, moveTime))
  }

  /**
   * @param steps - Number of steps to turn
   * @param side - 0 = left or 1 = right
   */
  turn = async (steps: string, side: string): Promise<void> => {
    side = ensureString(side);
    const moveTime = 1500
    let stepsInt = parseInt(steps)
    if (stepsInt === 0 || stepsInt < 0 || stepsInt > 20) {
      stepsInt = 1
    }
    let turn = 20
    if (side === '1') {
      turn *= -1
    }
    const command = `traj/step/${steps}/?moveTime=${moveTime}&turn=${turn}&stepLength=1`
    martyConnector.sendRestMessage(command)
    await new Promise((resolve) => setTimeout(resolve, moveTime * stepsInt))
  }

  /**
   * @param steps - Number of steps to walk
   * @param side - 25 = forward or -25 = backward
   */
  walk = async (steps: string, side: string): Promise<void> => {
    const moveTime = 1500
    let stepsInt = parseInt(steps)
    if (stepsInt === 0 || stepsInt < 0 || stepsInt > 20) {
      stepsInt = 1
    }
    const stepLength = side
    const command = `traj/step/${steps}/?moveTime=${moveTime}&stepLength=${stepLength}`
    martyConnector.sendRestMessage(command)
    await new Promise((resolve) => setTimeout(resolve, moveTime * stepsInt))
  }

  /**
   * @param steps - Number of steps to walk
   * @param stepLength - Number of step in mm
   * @param time - Time in seconds
   * @param angle - Angle in degrees
   */
  walk_expanded = async (
    steps: string,
    stepLength: string,
    time: string,
    angle: string,
  ): Promise<void> => {
    const timeInMs = parseFloat(time) * 1000
    const finalTime = Math.min(Math.max(timeInMs, 1), 10000)
    const parsedStepLenght = parseInt(stepLength)
    const finalStepLength = Math.min(Math.max(parsedStepLenght, -50), 50)
    let parsedSteps = parseInt(steps)
    if (parsedSteps === 0 || parsedSteps < 0 || parsedSteps > 20) {
      parsedSteps = 1
    }
    let turn = parseInt(angle)
    turn = Math.min(Math.max(turn, -25), 25)
    const command = `traj/step/${parsedSteps}/?moveTime=${finalTime}&stepLength=${finalStepLength}&turn=${turn}`
    martyConnector.sendRestMessage(command)
    await new Promise((resolve) => setTimeout(resolve, finalTime * parsedSteps))
  }

  /**
   * @param side - 0 = left or 1 = right
   */
  wave = async (side: string): Promise<void> => {
    const moveTime = 2500
    const command = `traj/wave/1/?side=${side}`
    martyConnector.sendRestMessage(command)
    await new Promise((resolve) => setTimeout(resolve, moveTime))
  }

  /**
   * @param hexColour - Hex colour
   */
  function_led_set = async (hexColour: string): Promise<void> => {
    const timeInMs = 1000
    let rgb = ColourHelper.hexToRgb(hexColour)
    if (rgb === null) {
      rgb = { r: 0, g: 0, b: 0 }
    }
    const command = `indicator/set?pixIdx=1;blinkType=on;r=${rgb.r};g=${rgb.g};b=${rgb.b};rateMs=${timeInMs}`
    martyConnector.sendRestMessage(command)
    await new Promise((resolve) => setTimeout(resolve, timeInMs))
  }

  /**
   * @param hexColour - Hex colour
   * @param timeInMs - Time in milliseconds
   */
  function_led_set_ms = async (hexColour: string, timeInMs: string): Promise<void> => {
    let rgb = ColourHelper.hexToRgb(hexColour)
    if (rgb === null) {
      rgb = { r: 0, g: 0, b: 0 }
    }
    const command = `indicator/set?pixIdx=1;blinkType=breathe;r=${rgb.r};g=${rgb.g};b=${rgb.b};rateMs=${timeInMs}`
    martyConnector.sendRestMessage(command)
    await new Promise((resolve) => setTimeout(resolve, parseInt(timeInMs)))
  }

  /**
   */
  function_led_off = async (): Promise<void> => {
    const command = `indicator/set?pixIdx=1;blinkType=off;r=0;g=0;b=0;rateMs=1000`
    martyConnector.sendRestMessage(command)
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  /**
   * @param LEDAddon - LEDfoot / LEDarm / LEDeye
   * @param pattern - show-off / pinwheel / off
   */
  leds_pattern = async (LEDAddon: string, pattern: string): Promise<void> => {
    const resolveTime = 200
    let command = `led/${LEDAddon}/pattern/${pattern}`
    if (pattern === 'off') {
      command = `led/${LEDAddon}/off`
    }
    martyConnector.sendRestMessage(command)
    await new Promise((resolve) => setTimeout(resolve, resolveTime))
  }

  /**
   * @param LEDAddon - LEDfoot / LEDarm / LEDeye
   * @param colour - hex
   */
  leds_colour = async (LEDAddon: string, colour: string): Promise<void> => {
    const resolveTime = 200
    const colourWithoutHash = colour.replace('#', '')
    const command = `led/${LEDAddon}/color/${colourWithoutHash}`
    martyConnector.sendRestMessage(command)
    await new Promise((resolve) => setTimeout(resolve, resolveTime))
  }

  /**
   * @param LEDAddon - LEDfoot / LEDarm / LEDeye
   * @param region - 0 / 1 / 2
   * @param colour - hex
   */
  leds_region = async (LEDAddon: string, region: string, colour: string): Promise<void> => {
    const resolveTime = 200
    const colourWithoutHash = colour.replace('#', '')
    const command = `led/${LEDAddon}/region/${region}/${colourWithoutHash}`
    martyConnector.sendRestMessage(command)
    await new Promise((resolve) => setTimeout(resolve, resolveTime))
  }

  /**
   * @param LEDAddon - LEDfoot / LEDarm / LEDeye
   * @param ledId -
   * @param colour - hex
   */
  leds_specific_led = async (LEDAddon: string, ledId: string, colour: string): Promise<void> => {
    const resolveTime = 200
    const colourWithoutHash = colour.replace('#', '')
    const ledIdMapped = AddonHelper.ledIdMapping(ledId)
    const command = `led/${LEDAddon}/setled/${ledIdMapped}/${colourWithoutHash}`
    martyConnector.sendRestMessage(command)
    await new Promise((resolve) => setTimeout(resolve, resolveTime))
  }

  /**
   * @param sound - Sound name
   * @details Plays a sound until the sound is finished
   */
  play_sound = async (soundName: string) => {
    const durationOffset = 1000 // adding 1 second to the duration to make sure the sound is played completely
    const soundDuration = SoundHelper.getSoundDuration(soundName)
    if (!soundDuration) {
      return await new Promise((resolve) => setTimeout(resolve, 0))
    }
    const mp3SoundData = await SoundHelper.fetchSound(soundName)
    martyConnector.streamAudio(mp3SoundData, soundDuration + durationOffset, true)
    await new Promise((resolve) => setTimeout(resolve, soundDuration + durationOffset))
  }

  /**
   * @param sound - Sound name
   * @details Plays a sound and returns immediately
   */
  start_sound = async (soundName: string) => {
    const durationOffset = 1000 // adding 1 second to the duration to make sure the sound is played completely
    const soundDuration = SoundHelper.getSoundDuration(soundName)
    if (!soundDuration) {
      return await new Promise((resolve) => setTimeout(resolve, 0))
    }
    const mp3SoundData = await SoundHelper.fetchSound(soundName)
    martyConnector.streamAudio(mp3SoundData, soundDuration + durationOffset, true)
    await new Promise((resolve) => setTimeout(resolve, 200)) // return (almost) immediately
  }

  /**
   */
  stop_all_sounds = async (): Promise<void> => {
    martyConnector.streamAudio(new Uint8Array([0]), 0, true)
  }

  /**
   * @param text - Text to speak
   * @param voice - Voice name
   * @param accent - Accent name
   */
  marty_speak = async (text: string, voice: string, accent: string) => {
    const voiceData = SoundHelper.getVoiceData(voice)
    if (!voiceData) {
      throw new Error(`Voice not found: ${voice}`)
    }
    let gender = voiceData.gender
    if (SoundHelper.LANGUAGE_DATA[accent].singleGender) {
      gender = 'female'
    }

    let locale = SoundHelper.LANGUAGE_DATA[accent].speechSynthLocale
    if (voice === 'kitten') {
      text = text.replace(/\S+/g, 'meow')
      locale = SoundHelper.LANGUAGE_DATA['en'].speechSynthLocale
    }

    return await SoundHelper.speak(text, gender, locale)
  }

  /**
   * @param axis - X or Y or Z
   * @returns Acceleration in G
   */
  accelerometer = async (axis: string): Promise<number> => {
    try {
      const accelObj = martyConnector.getAccelData()
      const accel = accelObj.accel[axis]
      return accel || 0
    } catch (error) {
      return 0
    }
  }

  /**
   * @returns Remaining battery in %
   */
  remaining_battery = async (): Promise<number> => {
    const battery = martyConnector.getBatteryRemainingCapacityPercent()
    return battery || 0
  }

  /**
   * @param joint - 0 = left hip or 1 = left twist or 2 = left knee or 3 = right hip or 4 = right twist or 5 = right knee or 6 = left arm or 7 = right arm or 8 = eyes
   * @returns Current in mA
   */
  current = async (joint: string): Promise<number> => {
    const current = martyConnector.getCurrent(joint)
    return current || 0
  }

  /**
   * @param joint - 0 = left hip or 1 = left twist or 2 = left knee or 3 = right hip or 4 = right twist or 5 = right knee or 6 = left arm or 7 = right arm or 8 = eyes
   * @returns Angle in degrees
   */
  position = async (joint: string): Promise<number> => {
    const position = martyConnector.getPosition(joint)
    return position || 0
  }

  /**
   * @returns distance sensor reading
   */
  distance = async (): Promise<number> => {
    const distance = martyConnector.getReadingFromDistanceSensor()
    return distance || 0
  }

  /**
   * @return is foot on the ground? (boolean)
   */
  foot_on_ground = async (): Promise<boolean> => {
    const footOnGround = martyConnector.isFootOnGround()
    return footOnGround || false
  }

  /**
   * @return is foot obstacle detected? (boolean)
   */
  foot_obstacle = async (): Promise<boolean> => {
    const footObstacle = martyConnector.isFootObstacle()
    return footObstacle || false
  }

  /**
   * @return colour as string
   */
  colour_sensor = async (): Promise<string> => {
    const colour = martyConnector.getColour()
    return colour || 'unclear'
  }

  /**
   * @param channel - clear/red/green/blue
   * @return colour channel value
   */
  colour_sensor_channel = async (channel: string): Promise<number> => {
    const colourChannel = martyConnector.getColourChannel(channel)
    return colourChannel || 0
  }

  /**
   * @return noise sensor reading
   */
  noise_sensor = async (): Promise<number> => {
    const noise = martyConnector.getNoiseSensorReading()
    return noise || 0
  }

  /**
   * @param channel - 1/2
   * @return light sensor reading for the given channel
   */
  light_sensor_channel = async (channel: string): Promise<number> => {
    const lightSensor = martyConnector.getLightSensorReading(channel)
    return lightSensor || 0
  }
}

/**
 * Makes sure the argument is string 
 * Also makes sure of wrong argument formats
 * @param arg - Argument to be checked
 * @returns The argument as string
 */
const ensureString = (arg: any): string => {
  if (typeof arg === 'string') {
    return arg
  }
  if (typeof arg === 'number') {
    return arg.toString()
  }
  if (typeof arg === 'boolean') {
    return arg.toString()
  }
  return ''
}
