export default class SensorHelper {
  static getGroundHelper(addon) {
    console.log('getGroundHelper', addon)
    for (const addonValKey in addon.vals) {
      const addonVal = addon.vals[addonValKey]
      if (addonValKey.includes('Air')) {
        return !addonVal
      }
    }
    return false
  }

  static getObstacleHelper(addon) {
    for (const addonValKey in addon.vals) {
      const addonVal = addon.vals[addonValKey]
      if (addonValKey.includes('Touch')) {
        return addonVal
      }
    }
    return false
  }

  static getNoise(addon) {
    for (const addonValKey in addon.vals) {
      const addonVal = addon.vals[addonValKey]
      if (addonValKey.includes('HighestSinceLastReading')) {
        return addonVal
      }
    }
    return null
  }

  static getLight(addon, channel) {
    for (const addonValKey in addon.vals) {
      const addonVal = addon.vals[addonValKey]
      if (addonValKey.toLocaleLowerCase().includes(channel.toLocaleLowerCase())) {
        return addonVal
      }
    }
    return null
  }
}
