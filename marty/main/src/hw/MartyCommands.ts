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
import { connectBLE, errmsg } from './marty-util'
import { sleepAsync } from '@/utls/misc'

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
   * get current connection state
   * An essential function that must be implemented.
   * The return value is automatically sent to the parent frame (CODINY)
   * @returns ConnectionState - connection state
   */
  getConnectionState = async (): Promise<ConnectionState> => {
    return this.connectionState
  }

  /**
   * get hardware id
   * An essential function that must be implemented.
   * The return value is automatically sent to the parent frame (CODINY)
   * @returns string - hwId
   */
  getHwId = async (): Promise<string> => {
    return this.hwId
  }

  /**
   * Function to connect to the hardware.
   * Check the connection status in ricConnector.setEventListener().
   * An essential function that must be implemented.
   * @returns The return value is meaningless.
   */
  connect = async (): Promise<boolean> => {
    await connectBLE(this.ricConnector)
    return true
  }

  /**
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
   * example command getRICStateInfo()
   * This function is a wrapper for ricConnector.sendRICRESTMsg().
   * The return value is automatically sent to the parent frame (CODINY)
   * @returns RICStateInfo
   */
  getRICStateInfo = async (): Promise<RICStateInfo> => {
    return this.ricConnector.getRICStateInfo()
  }

  /**
   * example command : sendRICRESTMsg()
   * This function is a wrapper for ricConnector.sendRICRESTMsg().
   * However, it includes an additional parameter called afterDelayMs.
   * @param cmd - Command
   * @param afterDelayMs - Time to wait after executing the command, no waiting if the value is 0
   * @param param - Parameters for the cmd
   * @returns The return value of ricConnector.sendRICRESTMsg()
   */
  sendRICRESTMsg = async (
    cmd: string,
    afterDelayMs: number,
    param?: object
  ): Promise<any> => {
    const result = await this.ricConnector.sendRICRESTMsg(cmd, param || {})
    if (afterDelayMs > 0) {
      await sleepAsync(afterDelayMs)
    }

    return result
  }
}
