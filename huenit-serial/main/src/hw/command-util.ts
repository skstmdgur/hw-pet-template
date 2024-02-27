import { errmsg } from '@/util/misc'

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
