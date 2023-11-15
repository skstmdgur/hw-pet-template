import { sleepAsync } from '@/utls/misc'

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
