import {
  HPetEvents,
  type ConnectionState,
  type IHPetCommandRunner,
  type IHPetContext,
  type IParentSender,
} from '@ktaicoder/hw-pet'
import type { RICStateInfo } from '@robotical/ricjs'
import { RICConnector } from '@robotical/ricjs'
import type EventEmitter from 'eventemitter3'
import * as helper from './marty-helper'
import { errmsg, sleepAsync } from '@/utls/misc'
import config from '@/config'
import log from '@/log'

const DEBUG = config.isDebug
const BASE_PATH = config.basePath

/**
 * Class for sending commands to the hardware.
 * Add the necessary commands here.
 * Write the method names the same as the commands.
 *
 * Lifecycle methods: init(), destroy()
 * Mandatory implementation methods: getConnectionState(), getHwId(), connect(), disconnect()
 * Additional commands are the remaining methods other than the ones mentioned above (e.g., sendRICRESTMsg).
 */
export class MartyCommands implements IHPetCommandRunner {
  private connectionState: ConnectionState = 'disconnected'
  private hwId: string
  private toParent: IParentSender
  private ricConnector: RICConnector
  private events: EventEmitter

  constructor(options: IHPetContext) {
    this.hwId = options.hwId
    this.toParent = options.toParent
    this.events = options.events
    this.ricConnector = new RICConnector()
  }

  /**
   * Lifecycle function, Automatically called.
   * An essential function that must be implemented.
   * Called once before communicating with parent frame (CODINY).
   * Initialization tasks, such as registering event listeners, can be performed here.
   */
  init = async (): Promise<void> => {
    this.ricConnector.setEventListener(
      (eventType, eventEnum, eventName, data) => {
        console.log('XXX [RIC Event]', {
          eventType,
          eventEnum,
          eventName,
          data,
        })

        // connection state changed
        if (eventType === 'conn') {
          if (eventName === 'CONNECTING_RIC') {
            this.updateConnectionState_('connecting')
          } else if (eventName === 'CONNECTED_RIC') {
            this.updateConnectionState_('connected')
          } else if (eventName === 'DISCONNECTED_RIC') {
            this.updateConnectionState_('disconnected')
          } else if (eventName === 'CONNECTION_FAILED') {
            this.updateConnectionState_('disconnected')
          }
          // "CONN_STREAMING_ISSUE" maybe need
        }
      }
    )
  }

  /**
   * Lifecycle function, Automatically called.
   * An essential function that must be implemented.
   * Called once after the connection with the hardware is terminated.
   * Cleanup tasks, such as unregistering event listeners, can be performed here.
   */
  destroy = async () => {
    // how do i unregister ricConnectors's event listeners?
    this.ricConnector.setEventListener(null)
  }

  /**
   * Update the connection state variable,
   * emit an event if the connection state has changed,
   * and notify the parent frame (CODINY).
   * @param state - The connection state
   */
  private updateConnectionState_ = (state: ConnectionState) => {
    if (state !== this.connectionState) {
      this.connectionState = state
      this.events.emit(
        HPetEvents.CONNECTION_STATE_CHANGED,
        this.connectionState
      )

      // notify to parent iframe
      this.toParent.notifyConnectionState(this.connectionState)
    }
  }

  /**
   * command: getConnectionState
   *
   * get current connection state
   * An essential function that must be implemented.
   * The return value is automatically sent to the parent frame (CODINY)
   * @returns ConnectionState - connection state
   */
  getConnectionState = async (): Promise<ConnectionState> => {
    return this.connectionState
  }

  /**
   * command: getHwId
   *
   * get hardware id
   * An essential function that must be implemented.
   * The return value is automatically sent to the parent frame (CODINY)
   * @returns string - hwId
   */
  getHwId = async (): Promise<string> => {
    return this.hwId
  }

  /**
   * command: connect
   * Function to connect to the hardware.
   * Check the connection status in ricConnector.setEventListener().
   * An essential function that must be implemented.
   * @returns The return value is meaningless.
   */
  connect = async (): Promise<boolean> => {
    await helper.connectBLE(this.ricConnector)
    return true
  }

  /**
   * command: disconnect
   *
   * Function to disconnect from the hardware.
   * An essential function that must be implemented.
   * @returns The return value is meaningless.
   */
  disconnect = async () => {
    try {
      await this.ricConnector.disconnect()
    } catch (err) {
      console.log('disconnect fail', errmsg(err))
    }
    this.updateConnectionState_('disconnected')
  }

  /**
   * command: getStateInfo
   * This function is a wrapper for ricConnector.sendRICRESTMsg().
   * The return value is automatically sent to the parent frame (CODINY)
   * @returns RICStateInfo
   */
  getStateInfo = async (): Promise<RICStateInfo> => {
    return this.ricConnector.getRICStateInfo()
  }

  /**
   * command: sendREST
   * This function is a wrapper for ricConnector.sendRICRESTMsg().
   * However, it includes an additional parameter called afterDelayMs.
   * @param cmd - RIC REST command
   * @param param - Parameters for the cmd
   * @param afterDelayMs - Time to wait after executing the command, no waiting if the value is 0
   * @returns The return value of ricConnector.sendRICRESTMsg()
   */
  sendREST = async (
    cmd: string,
    param?: object | null,
    afterDelayMs?: number
  ): Promise<any> => {
    const result = await this.ricConnector.sendRICRESTMsg(cmd, param || {})
    if (typeof afterDelayMs === 'number' && afterDelayMs > 0) {
      await sleepAsync(afterDelayMs)
    }

    return result
  }

  /**
   * command: sendFile()
   * 파일 전송
   * public/assets/files/ 폴더의 파일을 전송합니다
   * ex) soundtest_44100_48kbps.mp3, soundtest_44100_192kbps.mp3
   * @param fileName - fileName
   */
  sendFile = async (fileName: string): Promise<void> => {
    await helper.sendFile(this.ricConnector, fileName)
  }

  /**
   * command: streamSoundFile()
   * 소리 재생
   * public/assets/sounds/ 폴더의 파일을 재생합니다
   * ex) completed_tone_low_br.mp3
   * @param fileName - fileName
   */
  streamSoundFile = async (fileName: string): Promise<void> => {
    await helper.streamSoundFile(this.ricConnector, fileName)
  }

  /**
   * command: streamSoundFile()
   * 소리 재생
   * public/assets/sounds/ 폴더의 파일을 재생합니다
   * ex) completed_tone_low_br.mp3
   * @param fileName - fileName
   */
  startCheckCorrectRIC = async (): Promise<void> => {
    const availableColours = [
      { led: '#202000', lcd: '#FFFF00' },
      { led: '#880000', lcd: '#FF0000' },
      { led: '#000040', lcd: '#0080FF' },
    ]
    await this.ricConnector.checkCorrectRICStart(availableColours)
  }

  acceptCheckCorrectRIC = async (): Promise<void> => {
    await this.ricConnector.checkCorrectRICStop(true)
  }

  rejectCheckCorrectRIC = async (): Promise<void> => {
    await this.ricConnector.checkCorrectRICStop(false)
  }
}
