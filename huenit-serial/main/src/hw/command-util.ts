import { errmsg, sleepAsync } from '@/util/misc'

/**
 * Connects to the hardware.
 * Adds a dummy sleep to simulate actual hardware interaction.
 * @returns Promise<boolean>
 */
export async function fakeConnect(): Promise<boolean> {
  await sleepAsync(1000)
  return true
}

/**
 * Disconnects from the hardware.
 * Adds a dummy sleep to simulate actual hardware interaction.
 * @returns Promise<boolean>
 */
export async function fakeDisconnect(): Promise<boolean> {
  await sleepAsync(300)
  return true
}

export async function openSerialDevice(): Promise<SerialPort | undefined> {
  try {
    if ('serial' in navigator) {
      return await navigator.serial.requestPort()
    }
    console.error('Serial API is not supported in this browser.')
    return undefined
  } catch (err) {
    if (errmsg(err) === 'No port selected by the user') {
      return undefined
    }
    throw err
  }
}
