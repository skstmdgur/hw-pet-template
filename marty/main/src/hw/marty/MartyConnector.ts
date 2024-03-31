import { RICOKFail, RICConnector, RICConnEvent, RICServoParamUpdate } from '@robotical/ricjs'
import type {
  RICUpdateEvent,
  RICWifiConnStatus,
  RICCommsStats,
  RICWifiScanResults,
  RICSystemInfo,
} from '@robotical/ricjs'
import type { MartyObserver } from './MartyObserver'

import type { PystatusMsgType } from '@robotical/ricjs/src/RICTypes'
import { RICRoboticalAddOns } from '@robotical/ricjs-robotical-addons'
import MartySoundStreamingStats from './MartySoundStreamingStats'
import {
  RIC_WHOAMI_TYPE_CODE_ADDON_COLOUR,
  RIC_WHOAMI_TYPE_CODE_ADDON_DISTANCE,
  RIC_WHOAMI_TYPE_CODE_ADDON_IRFOOT,
  RIC_WHOAMI_TYPE_CODE_ADDON_LIGHT,
  RIC_WHOAMI_TYPE_CODE_ADDON_NOISE,
} from '@robotical/ricjs-robotical-addons/dist/RICRoboticalAddOns'
import ColourHelper from './helpers/ColourHelper'
import SensorHelper from './helpers/SensorHelper'

export class MartyConnector {
  // RIC
  public _ricConnector = new RICConnector()

  // Observers
  private _observers: { [key: string]: Array<MartyObserver> } = {}

  // RICNotificationsManager
  // private _ricNotificationsManager: RICNotificationsManager = new RICNotificationsManager(this)

  // Colours to use for LED patterns
  private ledLcdColours = [
    { led: '#202000', lcd: '#FFFF00' },
    { led: '#880000', lcd: '#FF0000' },
    { led: '#000040', lcd: '#0080FF' },
  ]

  // Updater removers: when marty disconnects
  // these functions will clear the time intervals
  // created for updating the sensors
  private updaterRemovers: (() => void)[] = []

  // Marty name
  public RICFriendlyName = ''

  // is connecting: from when the user presses the connect button to verifying the colours
  public isConnecting = false

  // sound streaming stats
  public soundStreamingStats = new MartySoundStreamingStats()

  // Marty version
  public martyVersion = '0.0.0'

  // Marty Serial Number
  public martySerialNo = ''

  // wifi scan duration
  private _wifiScanDuration = 10000 //ms

  // Joint names
  private _jointNames = {
    LeftHip: 'LeftHip',
    LeftTwist: 'LeftTwist',
    LeftKnee: 'LeftKnee',
    RightHip: 'RightHip',
    RightTwist: 'RightTwist',
    RightKnee: 'RightKnee',
    LeftArm: 'LeftArm',
    RightArm: 'RightArm',
    Eyes: 'Eyes',
  }

  // marty signal
  public martyRSSI: number

  // system infor
  public systemInfo: RICSystemInfo | null = null
  public isVerified = false

  // Constructor
  constructor() {
    // initialise servo param update so we start downloading servo parameter updates
    const spu = RICServoParamUpdate.getSingletonInstance(this._ricConnector.getRICMsgHandler())
    spu && spu.init()

    // registering addons
    const addOnManager = this._ricConnector.getAddOnManager()
    RICRoboticalAddOns.registerAddOns(addOnManager)

    // Subscribe to disconnect event
    this.onDisconnectEventSubscription()

    this.martyRSSI = -200
  }

  // Check if connected
  isConnected(): boolean {
    if (this._ricConnector) {
      return this._ricConnector.isConnected()
    }
    return false
  }

  /**
   * Connect to a RIC
   *
   * @param {string} method - can be "WebBLE" or "WebSocket"
   * @param {string | object} locator - either a string (WebSocket URL) or an object (WebBLE)
   * @returns Promise<boolean>
   *
   */
  async connect(method: string, locator: string | object): Promise<boolean> {
    // Check already connected
    if (this._ricConnector && this._ricConnector.isConnected()) {
      await this._ricConnector.disconnect()
    }

    // Connect to RIC
    const success = await this._ricConnector.connect(method, locator)
    if (!success) {
      console.log('Failed to connect to RIC')
      return false
    }

    const sysInfoOk = await this._ricConnector.retrieveMartySystemInfo()
    if (!sysInfoOk) {
      // this.emit(RIC_REJECTED)
      return false
    } else {
      // this.emit(VERIFIED_CORRECT_ricConnector, { systemInfo: this._ricConnectorSystem.getRICSystemInfo() });
    }

    //  -----check if the ric is in unplugged mode------
    const pystatus = await this.sendRestMessage('pystatus')
    // if it's in unplugged mode update the relevant state
    // that shows a modal
    if (pystatus && (pystatus as unknown as PystatusMsgType).running === 'screenfree.py') {
      // TODO: MARTY is in unplugged mode meaning that it is operating without the need of the app
      // TODO: show a modal that informs the user that MARTY is in unplugged mode and that they can't use the app unless they turn off unplugged mode by pressing the button on MARTY's back
      await this._ricConnector.disconnect()
      return false
    }

    // start verification process
    // TDOD: we need to verify here that we are connecting to the correct robot

    return true
  }

  async verifyMarty() {
    return this._ricConnector.checkCorrectRICStart(this.ledLcdColours)
  }

  async stopVerifyingMarty(confirmCorrectRIC: boolean) {
    if (confirmCorrectRIC) {
      // successful connection to Marty
      const ricSystem = this._ricConnector.getRICSystem()

      const systemInfo = await ricSystem.getRICSystemInfo(true)
      this.systemInfo = systemInfo
      this.martyVersion = systemInfo.SystemVersion
      this.isVerified = true

      // add a callback to display warning messages from RIC to the user
      // this._ricNotificationsManager.setNotificationsHandler(this._ricConnector.getRICMsgHandler())

      // servo parameters update
      const spu = RICServoParamUpdate.getSingletonInstance()
      spu && spu.setRobotConnected(true)

      this._ricConnector.setLegacySoktoMode(
        this.soundStreamingStats.shouldUseLegacySoktoMode(systemInfo),
      )
      // checking for servo faults (this will trigger reportMsgCallback)
      console.log('checking for servo faults')
      this._ricConnector.ricServoFaultDetector.atomicReadOperation()
    }
    return this._ricConnector.checkCorrectRICStop(confirmCorrectRIC)
  }

  async getConnectedAddOns() {
    const ricSystem = this._ricConnector.getRICSystem()
    const elemList = await ricSystem.getHWElemList('RSAddOn')
    return elemList
  }

  async getAddOnConfigs() {
    const ricSystem = this._ricConnector.getRICSystem()
    const addOnList = await ricSystem.getAddOnConfigs()
    return addOnList
  }

  async identifyAddOn(name: string) {
    await this._ricConnector.identifyAddOn(name)
  }

  async setAddOnConfig(serialNo: string, newName: string) {
    await this._ricConnector.setAddOnConfig(serialNo, newName)
  }

  async deleteAddOn(serialNo: string) {
    await this._ricConnector.deleteAddOn(serialNo)
  }

  getCachedRICName() {
    return this.RICFriendlyName
  }

  async getRICName() {
    const ricSystem = this._ricConnector.getRICSystem()
    const nameObj = await ricSystem.getRICName()
    this.RICFriendlyName = nameObj.friendlyName
    return nameObj.friendlyName
  }

  async setRICName(newName: string) {
    try {
      const ricSystem = this._ricConnector.getRICSystem()
      await ricSystem.setRICName(newName)
    } catch (e) {
      console.log("Couldn't set Marty name", e)
    }
  }

  getBatteryStrength() {
    const ricState = this._ricConnector.getRICStateInfo()
    return ricState.power.powerStatus.battRemainCapacityPercent
  }

  addUpdaterRemover(updaterRemover: () => void) {
    this.updaterRemovers.push(updaterRemover)
  }

  clearUpdatersAfterDisconnect() {
    this.updaterRemovers.forEach((updaterRemover) => {
      updaterRemover()
    })
    this.updaterRemovers = []
  }

  async disconnect(): Promise<boolean> {
    await this._ricConnector?.disconnect()
    this.clearUpdatersAfterDisconnect()
    this.martySerialNo = ''
    this.martyVersion = '0.0.0'
    this.isVerified = false
    return true
  }

  async sendRestMessage(msg: string, params?: object): Promise<RICOKFail> {
    if (this._ricConnector) {
      return this._ricConnector.sendRICRESTMsg(msg, params || {})
    }
    return new RICOKFail()
  }

  async streamAudio(
    audioData: Uint8Array,
    duration: number,
    clearExisting?: boolean,
  ): Promise<boolean> {
    console.log(`streamAudio length ${audioData.length}`)
    if (this._ricConnector) {
      this._ricConnector.streamAudio(audioData, !!clearExisting, duration)
      return true
    }
    return false
  }

  isStreamStarting() {
    if (this._ricConnector) {
      return this._ricConnector.isStreamStarting()
    }
    return false
  }

  // Marty observer
  subscribe(observer: MartyObserver, topics: Array<string>): void {
    for (const topic of topics) {
      if (!this._observers[topic]) {
        this._observers[topic] = []
      }
      if (this._observers[topic].indexOf(observer) === -1) {
        this._observers[topic].push(observer)
      }
    }
  }

  unsubscribe(observer: MartyObserver): void {
    for (const topic in this._observers) {
      // eslint-disable-next-line no-prototype-builtins
      if (this._observers.hasOwnProperty(topic)) {
        const index = this._observers[topic].indexOf(observer)
        if (index !== -1) {
          this._observers[topic].splice(index, 1)
        }
      }
    }
  }

  onDisconnectEventSubscription(): void {
    // This function subscribes to the disconnect event that comes from RICJS
    // when the RIC is disconnected (either by the user or by losing connection)
    // Essentially, this makes sure that we update the state of the app when
    // the RIC is disconnected
    this.subscribe(
      {
        notify: (
          eventType: string,
          eventEnum: RICConnEvent | RICUpdateEvent,
          eventName: string,
          eventData: string | object | null | undefined,
        ) => {
          if (eventType === 'conn') {
            if (eventEnum === RICConnEvent.CONN_DISCONNECTED_RIC) {
              this.clearUpdatersAfterDisconnect()
            }
          }
        },
      },
      ['conn'],
    )
  }

  publish(
    eventType: string,
    eventEnum: RICConnEvent | RICUpdateEvent,
    eventName: string,
    eventData: string | object | null | undefined,
  ): void {
    // eslint-disable-next-line no-prototype-builtins
    if (this._observers.hasOwnProperty(eventType)) {
      for (const observer of this._observers[eventType]) {
        observer.notify(eventType, eventEnum, eventName, eventData)
      }
    }
  }

  // mark: wifi configuration
  getCachedWifiStatus(): RICWifiConnStatus {
    const ricSystem = this._ricConnector.getRICSystem()
    return ricSystem.getCachedWifiStatus()
  }

  // mark: wifi connect
  async wifiConnect(ssid: string, password: string): Promise<boolean> {
    const ricSystem = this._ricConnector.getRICSystem()
    return ricSystem.wifiConnect(ssid, password)
  }

  // mark: wifi disconnect
  async wifiDisconnect(): Promise<boolean> {
    const ricSystem = this._ricConnector.getRICSystem()
    return ricSystem.wifiDisconnect()
  }

  // mark: wifi getWiFiConnStatus
  async getWiFiConnStatus(): Promise<boolean | null> {
    const ricSystem = this._ricConnector.getRICSystem()
    return ricSystem.getWiFiConnStatus()
  }

  // mark: pause wifi
  async pauseWifiConnection(pause: boolean) {
    const ricSystem = this._ricConnector.getRICSystem()
    return ricSystem.pauseWifiConnection(pause)
  }

  // mark: get rssi of connected marty
  getRSSI() {
    const ricState = this._ricConnector.getRICStateInfo()
    const rssiValue = ricState.robotStatus.robotStatus.bleRSSI
    this.martyRSSI = rssiValue
    return rssiValue
  }

  // mark: wifi scan get results
  async wifiScanResults(): Promise<RICWifiScanResults | false> {
    const ricSystem = this._ricConnector.getRICSystem()
    await ricSystem.wifiScanStart()
    let resultsTimeout: NodeJS.Timeout
    const results: RICOKFail | RICWifiScanResults = await new Promise(
      (resolve, reject) =>
      (resultsTimeout = setTimeout(() => {
        ricSystem
          .wifiScanResults()
          .then((wifiscanMsgResults: boolean | RICOKFail | RICWifiScanResults) => {
            if (typeof wifiscanMsgResults !== 'boolean') {
              resolve(wifiscanMsgResults)
            } else {
              reject(new Error('wifiScanResults failed'))
            }
          })
          .catch((err: unknown) => {
            reject(err)
          })
          .finally(() => {
            clearTimeout(resultsTimeout)
          })
      }, this._wifiScanDuration)),
    )

    // eslint-disable-next-line no-prototype-builtins
    if ((results as RICWifiScanResults).hasOwnProperty('wifi')) {
      return results as RICWifiScanResults
    }
    return false
  }

  // mark: calibration
  async calibrate(cmd: string, joints: string) {
    // Make a list of joints to calibrate on
    const jointList: Array<string> = new Array<string>()
    if (joints === 'legs') {
      jointList.push(this._jointNames.LeftHip)
      jointList.push(this._jointNames.LeftTwist)
      jointList.push(this._jointNames.LeftKnee)
      jointList.push(this._jointNames.RightHip)
      jointList.push(this._jointNames.RightTwist)
      jointList.push(this._jointNames.RightKnee)
    } else if (joints === 'arms') {
      jointList.push(this._jointNames.LeftArm)
      jointList.push(this._jointNames.RightArm)
    }
    if (joints === 'eyes') {
      jointList.push(this._jointNames.Eyes)
    }

    const ricSystem = this._ricConnector.getRICSystem()
    return ricSystem.calibrate(cmd, jointList, this._jointNames)
  }

  // Mark: Comms stats -----------------------------------------------------------------------------------------

  getCommsStats(): RICCommsStats {
    return this._ricConnector.getCommsStats()
  }

  getAccelData() {
    const ricStateInfo = this._ricConnector.getRICStateInfo()
    return ricStateInfo.imuData
  }

  getBatteryRemainingCapacityPercent() {
    const ricStateInfo = this._ricConnector.getRICStateInfo()
    return ricStateInfo.power.powerStatus.battRemainCapacityPercent
  }

  getCurrent(jointStr: string) {
    const jointNum = parseInt(jointStr)
    const ricStateInfo = this._ricConnector.getRICStateInfo()
    return ricStateInfo.smartServos.smartServos[jointNum].current
  }

  getPosition(jointStr: string) {
    const jointNum = parseInt(jointStr)
    const ricStateInfo = this._ricConnector.getRICStateInfo()
    return ricStateInfo.smartServos.smartServos[jointNum].pos
  }

  getIRFObstacleSensorReading() {
    const ricStateInfo = this._ricConnector.getRICStateInfo()
    const addons = ricStateInfo.addOnInfo.addons
    let dsVal: number | null = null
    for (const addon of addons) {
      if (addon.whoAmI === RIC_WHOAMI_TYPE_CODE_ADDON_IRFOOT) {
        for (const val in addon.vals) {
          if (val.includes('Touch_IR')) {
            dsVal = addon.vals[val] as number
          }
        }
      }
    }
    if (dsVal !== null) return dsVal
    return 0
  }

  getObstacleSensorReadingFromColorSensor() {
    const ricStateInfo = this._ricConnector.getRICStateInfo()
    const addons = ricStateInfo.addOnInfo.addons
    let dsVal: number | null = null
    for (const addon of addons) {
      if (addon.whoAmI === RIC_WHOAMI_TYPE_CODE_ADDON_COLOUR) {
        for (const val in addon.vals) {
          if (val.includes('IRVal')) {
            dsVal = addon.vals[val] as number
          }
        }
      }
    }
    if (dsVal !== null) return dsVal
    return 0
  }

  getReadingFromDistanceSensor(): number {
    const ricStateInfo = this._ricConnector.getRICStateInfo()
    const addons = ricStateInfo.addOnInfo.addons
    let dsVal: number | null = null
    for (const addon of addons) {
      if ('DistanceSensorReading' in addon.vals) {
        return addon.vals['DistanceSensorReading'] as number
      }
      if (addon.whoAmI === RIC_WHOAMI_TYPE_CODE_ADDON_DISTANCE) {
        for (const val in addon.vals) {
          if (val.includes('Reading')) dsVal = addon.vals[val] as number
        }
      }
    }
    if (dsVal !== null) return dsVal
    return 0
  }

  isFootOnGround(sensor: "color" | "IRF"): boolean {
    const ricStateInfo = this._ricConnector.getRICStateInfo()
    const addons = ricStateInfo.addOnInfo.addons
    if (sensor === 'color') {
      for (const addon of addons) {
        if (addon.whoAmI === RIC_WHOAMI_TYPE_CODE_ADDON_COLOUR) {
          return SensorHelper.getGroundHelper(addon)
        }
      }
    }
    if (sensor === 'IRF') {
      for (const addon of addons) {
        if (addon.whoAmI === RIC_WHOAMI_TYPE_CODE_ADDON_IRFOOT) {
          return SensorHelper.getGroundHelper(addon)
        }
      }
    }
    return false
  }

  isFootObstacle(sensor: "color" | "IRF"): boolean {
    const ricStateInfo = this._ricConnector.getRICStateInfo()
    const addons = ricStateInfo.addOnInfo.addons
    if (sensor === 'color') {
      for (const addon of addons) {
        if (addon.whoAmI === RIC_WHOAMI_TYPE_CODE_ADDON_COLOUR) {
          return SensorHelper.getObstacleHelper(addon)
        }
      }
    }
    if (sensor === 'IRF') {
      for (const addon of addons) {
        if (addon.whoAmI === RIC_WHOAMI_TYPE_CODE_ADDON_IRFOOT) {
          return SensorHelper.getObstacleHelper(addon)
        }
      }
    }
    return false
  }

  getColour(): string {
    const ricStateInfo = this._ricConnector.getRICStateInfo()
    const addons = ricStateInfo.addOnInfo.addons
    for (const addon of addons) {
      if (addon.whoAmI === RIC_WHOAMI_TYPE_CODE_ADDON_COLOUR) {
        return ColourHelper.getColourHelper(addon)
      }
    }
    return 'black'
  }

  getColourChannel(channel: string): number {
    const ricStateInfo = this._ricConnector.getRICStateInfo()
    const addons = ricStateInfo.addOnInfo.addons
    for (const addon of addons) {
      if (addon.whoAmI === RIC_WHOAMI_TYPE_CODE_ADDON_COLOUR) {
        return ColourHelper.getColourChannel(addon, channel)
      }
    }
    return 0
  }

  getNoiseSensorReading(): number {
    const ricStateInfo = this._ricConnector.getRICStateInfo()
    const addons = ricStateInfo.addOnInfo.addons
    for (const addon of addons) {
      if (addon.whoAmI === RIC_WHOAMI_TYPE_CODE_ADDON_NOISE) {
        return SensorHelper.getNoise(addon)
      }
    }
    return 0
  }

  getLightSensorReading(channel: string): number {
    const ricStateInfo = this._ricConnector.getRICStateInfo()
    const addons = ricStateInfo.addOnInfo.addons
    for (const addon of addons) {
      if (addon.whoAmI === RIC_WHOAMI_TYPE_CODE_ADDON_LIGHT) {
        return SensorHelper.getLight(addon, channel)
      }
    }
    return 0
  }
}

const martyConnector = new MartyConnector()
export default martyConnector
