import type { RICConnector } from '@robotical/ricjs'
import config from '@/config'
import { RICChannelWebBLE } from '@robotical/ricjs'
import { errmsg } from '@/utls/misc'
import log from '@/log'

const basePath = config.basePath

const joinBasePath = (...paths: string[]) => {
  const fullPath = [basePath, ...paths].join('/')
  const normalized = fullPath
    .split('/')
    .filter((it) => it.length > 0)
    .join('/')

  return `/${normalized}`
}

export async function connectBLE(ricConnector: RICConnector): Promise<boolean> {
  const device = await getBleDevice()
  if (!device) {
    return false
  }

  try {
    const connected = await ricConnector.connect('WebBLE', device)
    if (connected) {
      log.debug(`connectBLE(): connected to device ${device.name}`)
    } else {
      log.debug('connectBLE(): failed to connect')
    }
    return connected
  } catch (err) {
    log.debug('connectBLE() fail:', err)
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
    log.debug(`getBleDevice(): failed to get device ${errmsg(e)}`)
    return null
  }
}

function fetchUint8Array(filePath: string): Promise<Uint8Array | null> {
  log.debug(`fetchUint8Array(): ${filePath}`)
  return fetch(filePath)
    .then((response) => response.arrayBuffer())
    .then((data) => new Uint8Array(data))
    .catch((err) => {
      log.debug(`file download fail: ${errmsg(err)}`)
      return null
    })
}

export async function sendFile(
  ricConnector: RICConnector,
  fileName: string
): Promise<void> {
  const fileUrl = joinBasePath('/assets/files', encodeURIComponent(fileName))
  const fileData = await fetchUint8Array(fileUrl)
  if (!fileData) {
    log.warn(`sendFile(): file fetch failed: ${fileUrl}`)
    return
  }

  await ricConnector.sendFile(fileName, fileData, (sent, total, progress) => {
    console.debug(`fileSend sent ${sent} total ${total} progress ${progress}%`)
  })
}

export async function streamSoundFile(
  ricConnector: RICConnector,
  fileName: string
): Promise<void> {
  const fileUrl = joinBasePath('/assets/sounds', encodeURIComponent(fileName))
  const audioData = await fetchUint8Array(fileUrl)

  if (!audioData) {
    log.warn(`streamSoundFile(): file fetch failed: ${fileUrl}`)
    return
  }

  let audioDuration
  if (fileName === 'completed_tone_low_br.mp3') {
    audioDuration = 3000
  } else if (fileName === 'test440ToneQuietShort.mp3') {
    audioDuration = 15000
  } else {
    audioDuration = 1000
  }

  ricConnector.streamAudio(audioData, true, audioDuration)
}

export async function startCheckCorrectRIC(
  ricConnector: RICConnector
): Promise<void> {
  const availableColours = [
    { led: '#202000', lcd: '#FFFF00' },
    { led: '#880000', lcd: '#FF0000' },
    { led: '#000040', lcd: '#0080FF' },
  ]

  // Set the colours to display on LEDs
  globalThis.ricConnector.checkCorrectRICStart(availableColours)
}

export async function acceptCheckCorrectRIC(
  ricConnector: RICConnector
): Promise<void> {
  await ricConnector.checkCorrectRICStop(true)
}

export async function rejectCheckCorrectRIC(
  ricConnector: RICConnector
): Promise<void> {
  await ricConnector.checkCorrectRICStop(false)
}
