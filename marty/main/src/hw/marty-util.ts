import type { RICConnector } from '@robotical/ricjs'
import { RICChannelWebBLE } from '@robotical/ricjs'

export function errmsg(err: any): string {
  if (!err) return 'unknown'
  if (typeof err === 'string') return err
  if (typeof err['message'] === 'string') {
    return err['message']
  }
  return err.toString()
}

export async function connectBLE(ricConnector: RICConnector): Promise<boolean> {
  const device = await getBleDevice()
  if (!device) {
    return false
  }

  try {
    const connected = await ricConnector.connect('WebBLE', device)
    if (connected) {
      console.info(`connectBLE - connected to device ${device.name}`)
    } else {
      console.info('connectBLE - failed to connect')
    }
    return connected
  } catch (err) {
    console.warn('connectBLE() fail:', err)
  }
  return false
}

export async function getBleDevice(): Promise<BluetoothDevice | null> {
  try {
    const dev = await navigator.bluetooth.requestDevice({
      filters: [{ services: [RICChannelWebBLE.RICServiceUUID] }],
      optionalServices: [],
    })
    return dev
  } catch (e) {
    console.warn(`getBleDevice - failed to get device ${e}`)
    return null
  }
}
