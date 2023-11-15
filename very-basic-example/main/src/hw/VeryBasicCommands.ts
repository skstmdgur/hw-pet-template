import {
  HPetEvents,
  type ConnectionState,
  type IHPetCommandRunner,
  type IHPetContext,
  type IParentSender,
} from '@ktaicoder/hw-pet'
import type EventEmitter from 'eventemitter3'
import { fakeConnect, fakeDisconnect } from './command-util'

/**
 * Class for sending commands to the hardware.
 * Add the necessary commands here.
 * Write the method names the same as the commands.
 *
 * Lifecycle methods: init(), destroy()
 * Mandatory implementation methods: getConnectionState(), getHwId(), connect(), disconnect()
 * Additional commands are the remaining methods other than the ones mentioned above (e.g., sendRICRESTMsg).
 */
export class VeryBasicCommands implements IHPetCommandRunner {
  private connectionState: ConnectionState = 'disconnected'
  private hwId: string
  private toParent: IParentSender
  private events: EventEmitter

  constructor(options: IHPetContext) {
    this.hwId = options.hwId
    this.toParent = options.toParent
    this.events = options.events
  }

  /**
   * Lifecycle function, Automatically called.
   * An essential function that must be implemented.
   * Called once before communicating with parent frame (CODINY).
   * Initialization tasks, such as registering event listeners, can be performed here.
   */
  init = async (): Promise<void> => {
    console.log('VeryBasicCommands.init()')
  }

  /**
   * Lifecycle function, Automatically called.
   * An essential function that must be implemented.
   * Called once after the connection with the hardware is terminated.
   * Cleanup tasks, such as unregistering event listeners, can be performed here.
   */
  destroy = async () => {
    console.log('VeryBasicCommands.destroy()')
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

      // notify to parent frame (CODINY)
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
   * An essential function that must be implemented.
   * @returns The return value is meaningless.
   */
  connect = async (): Promise<boolean> => {
    await fakeConnect()

    // When changing the connection state, be sure to call updateConnectionState_()
    this.updateConnectionState_('connected')
    return true
  }

  /**
   * Function to disconnect from the hardware.
   * An essential function that must be implemented.
   * @returns The return value is meaningless.
   */
  disconnect = async () => {
    await fakeDisconnect().catch((err) => {
      // ignore error
    })

    // When changing the connection state, be sure to call updateConnectionState_()
    this.updateConnectionState_('disconnected')
  }

  /**
   * example command foo
   * The return value is automatically sent to the parent frame (CODINY)
   * @returns 'bar'
   */
  foo = async (): Promise<string> => {
    return 'bar'
  }

  /**
   * example command echo
   * @param what - string to echo
   * The return value is automatically sent to the parent frame (CODINY)
   * @returns echo string
   */
  echo = async (what: string): Promise<string> => {
    return what
  }
}
