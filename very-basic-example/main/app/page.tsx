'use client'

import { HW_ID, HW_NAME } from '@/constant'
import { CommandRunner } from '@/hw/CommandRunner'
import { Box } from '@mui/material'
import { ConnectButton, HardwareImageBox, HardwareNameBox, MediaIconBox, usePet } from '@repo/ui'
import { useSearchParams } from 'next/navigation'

const LOGO_IMG_URL = 'logo.png'

const MEDIA_ICON = 'bluetooth.svg' // for bluetooth device
// const MEDIA_ICON = 'usb.svg' // for serial device

export default function Page() {
  const { commandRunner, connectionState, pet } = usePet(HW_ID, CommandRunner, useSearchParams())

  // Click handler for the Connect button
  const handleClickConnectBtn = () => {
    const runner = commandRunner
    if (!runner) return
    runner.connect()
  }

  // Click handler for the Disconnect button
  const handleClickDisconnectBtn = () => {
    const runner = commandRunner
    if (!runner) {
      return
    }
    runner.disconnect()
  }

  return (
    <Box
      sx={{
        pt: 2,
        bgcolor: '#fff',
      }}
    >
      <HardwareImageBox src={LOGO_IMG_URL} />
      <HardwareNameBox title={HW_NAME.en} />
      <MediaIconBox mediaIcon={MEDIA_ICON} />
      <ConnectButton
        connectionState={connectionState}
        onClickConnectBtn={handleClickConnectBtn}
        onClickDisconnectBtn={handleClickDisconnectBtn}
      />
    </Box>
  )
}
