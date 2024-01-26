import config from '@/config'
import log from '@/log'
import { errmsg, sleepAsync } from '@/utls/misc'
import {
  HPetNotifyEventKeys,
  type ConnectionState,
  type HPetNotifiyEventDefinition,
  type IHPetCommandRunner,
  type IHPetContext,
  type IParentSender,
} from '@ktaicoder/hw-pet'
import type { RICStateInfo } from '@robotical/ricjs'
import type EventEmitter from 'eventemitter3'
import * as helper from './marty-helper'
import { MartyBlocks } from './marty/MartyBlocks'
import martyConnector from './marty/MartyConnector'
import type { MartyConnectionState } from './types'

const DEBUG = config.isDebug

/**
 * Class for sending commands to the hardware.
 * Add the necessary commands here.
 * Write the method names the same as the commands.
 *
 * Lifecycle methods: init(), destroy()
 * Mandatory implementation methods: getConnectionState(), getHwId(), connect(), disconnect()
 * Additional commands are the remaining methods other than the ones mentioned above (e.g., sendRICRESTMsg).
 */
export class CommandRunner extends MartyBlocks implements IHPetCommandRunner {
  private connectionState: MartyConnectionState = 'disconnected'
  private hwId: string
  private toParent: IParentSender
  private notifyEvents: EventEmitter<HPetNotifiyEventDefinition>

  constructor(options: IHPetContext) {
    super()
    this.hwId = options.hwId
    this.toParent = options.toParent
    this.notifyEvents = options.notifyEvents
  }

  /**
   * Lifecycle function, Automatically called.
   * An essential function that must be implemented.
   * Called once before communicating with parent frame (CODINY).
   * Initialization tasks, such as registering event listeners, can be performed here.
   */
  init = async (): Promise<void> => {
    martyConnector._ricConnector.setEventListener((eventType, eventEnum, eventName, data) => {
      if (DEBUG) {
        log.debug('XXX [RIC Event]', {
          eventType,
          eventEnum,
          eventName,
          data,
        })
      }
      martyConnector.publish(eventType, eventEnum, eventName, data)
      // connection state changed
      if (eventType === 'conn') {
        if (eventName === 'CONNECTING_RIC') {
          this.updateConnectionState_('connecting')
        } else if (eventName === 'CONNECTED_RIC') {
          this.updateConnectionState_('verifying')
        } else if (eventName === 'DISCONNECTED_RIC') {
          this.updateConnectionState_('disconnected')
        } else if (eventName === 'CONNECTION_FAILED') {
          this.updateConnectionState_('disconnected')
        } else if (eventName === 'VERIFIED_CORRECT_RIC') {
          this.updateConnectionState_('connected')
        }
        // "CONN_STREAMING_ISSUE" maybe need
      }
    })
  }

  /**
   * Lifecycle function, Automatically called.
   * An essential function that must be implemented.
   * Called once after the connection with the hardware is terminated.
   * Cleanup tasks, such as unregistering event listeners, can be performed here.
   */
  destroy = async () => {
    // how do i unregister ricConnectors's event listeners?
    martyConnector._ricConnector.setEventListener(null)
  }

  /**
   * Update the connection state variable,
   * emit an event if the connection state has changed,
   * and notify the parent frame (CODINY).
   * @param state - The connection state
   */
  private updateConnectionState_ = (state: MartyConnectionState) => {
    if (state !== this.connectionState) {
      this.connectionState = state
      this.notifyEvents.emit(
        HPetNotifyEventKeys.connectionStateChanged,
        this.connectionState as any,
      )

      // notify to parent iframe
      this.toParent.notifyConnectionState(this.connectionState as any)
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
    return this.connectionState as any
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
   *
   * Function to connect to the hardware.
   * Check the connection status in ricConnector.setEventListener().
   * An essential function that must be implemented.
   * @returns The return value is meaningless.
   */
  connect = async (): Promise<boolean> => {
    await helper.connectBLE(martyConnector._ricConnector)
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
      await martyConnector._ricConnector.disconnect()
    } catch (err) {
      log.debug('disconnect fail', errmsg(err))
    }
    this.updateConnectionState_('disconnected')
  }

  /**
   * command: getStateInfo
   *
   * This function is a wrapper for ricConnector.sendRICRESTMsg().
   * The return value is automatically sent to the parent frame (CODINY)
   * @returns RICStateInfo
   */
  getStateInfo = async (): Promise<RICStateInfo> => {
    return martyConnector._ricConnector.getRICStateInfo()
  }

  /**
   * command: sendREST
   *
   * This function is a wrapper for ricConnector.sendRICRESTMsg().
   * However, it includes an additional parameter called afterDelayMs.
   * @param cmd - RIC REST command
   * @param param - Parameters for the cmd
   * @param afterDelayMs - Time to wait after executing the command, no waiting if the value is 0
   * @returns The return value of ricConnector.sendRICRESTMsg()
   */
  sendREST = async (cmd: string, param?: object | null, afterDelayMs?: number): Promise<any> => {
    const result = await martyConnector._ricConnector.sendRICRESTMsg(cmd, param ?? {})
    if (typeof afterDelayMs === 'number' && afterDelayMs > 0) {
      await sleepAsync(afterDelayMs)
    }

    return result
  }

  /**
   * command: sendFile
   * Sends a file
   * Transmits a file from the public/assets/files/ folder
   * e.g., soundtest_44100_48kbps.mp3, soundtest_44100_192kbps.mp3
   * @param fileName - The name of the file to be sent
   */
  sendFile = async (fileName: string): Promise<void> => {
    await helper.sendFile(martyConnector._ricConnector, fileName)
  }

  /**
   * command: streamSoundFile
   *
   * Plays a sound
   * Plays a file from the public/assets/sounds/ folder
   * e.g., completed_tone_low_br.mp3
   * @param fileName - The name of the file to be played
   */
  streamSoundFile = async (fileName: string): Promise<void> => {
    await helper.streamSoundFile(martyConnector._ricConnector, fileName)
  }

  /**
   * command: startCheckCorrectRIC
   */
  startCheckCorrectRIC = async (): Promise<void> => {
    const availableColours = [
      { led: '#202000', lcd: '#FFFF00' },
      { led: '#880000', lcd: '#FF0000' },
      { led: '#000040', lcd: '#0080FF' },
    ]
    await martyConnector._ricConnector.checkCorrectRICStart(availableColours)
  }

  /**
   * command: acceptCheckCorrectRIC
   */
  acceptCheckCorrectRIC = async (): Promise<void> => {
    await martyConnector._ricConnector.checkCorrectRICStop(true)
  }

  /**
   * command: rejectCheckCorrectRIC
   */
  rejectCheckCorrectRIC = async (): Promise<void> => {
    await martyConnector._ricConnector.checkCorrectRICStop(false)
  }
}
