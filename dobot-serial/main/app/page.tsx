'use client'

import { HW_ID, HW_NAME } from '@/constant'
import { CommandRunner } from '@/hw/CommandRunner'
import { Box, TextField } from '@mui/material'
import { ConnectButton, HardwareImageBox, HardwareNameBox, MediaIconBox, usePet } from '@repo/ui'
import { useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
const LOGO_IMG_URL = 'dobot.jpg'

const MEDIA_ICON = 'usb.svg'

export default function Page() {
  return (
    <Suspense>
      <PageInternal />
    </Suspense>
  )
}

function PageInternal() {
  const { commandRunner, connectionState, pet } = usePet(HW_ID, CommandRunner, useSearchParams())

  // State for the IP address
  const [ipAddress, setIpAddress] = useState('')

  // Handler for IP address input change
  const handleIpChange = (event) => {
    setIpAddress(event.target.value)
  }

  // Click handler for the Connect button
  const handleClickConnectBtn = () => {
    const runner = commandRunner
    if (!runner) return
    runner.testConnect(ipAddress) // Pass the IP address when connecting
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

      {/* IP Address Input Box */}
      <Box sx={{ mb: 2 }}>
        <TextField
          label="IP Address"
          variant="outlined"
          fullWidth
          value={ipAddress}
          onChange={handleIpChange}
        />
      </Box>

      <ConnectButton
        connectionState={connectionState}
        onClickConnectBtn={handleClickConnectBtn}
        onClickDisconnectBtn={handleClickDisconnectBtn}
      />
    </Box>
  )
}
