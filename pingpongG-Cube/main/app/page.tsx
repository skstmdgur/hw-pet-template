'use client'

import type { ConnectionState } from '@ktaicoder/hw-pet'
import { HPet, HPetEventKeys } from '@ktaicoder/hw-pet'
import { Box, ButtonBase, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { HW_ID, HW_NAME } from '@/constant'
import { CommandRunner } from '@/hw/CommandRunner'

const LOGO_IMG_URL = 'logo.png'

const BLUETOOTH_IMG_URL = 'bluetooth.svg'

export default function Page() {
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected')

  const [commandRunner, setCommandRunner] = useState<CommandRunner>()

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

  useEffect(() => {
    const pet = new HPet({
      hwId: HW_ID,
      commandRunnerClass: CommandRunner,
    })

    pet.on(HPetEventKeys.CommandRunner.stateChanged, (data) => {
      const { state, commandRunner } = data
      if (state === 'started') {
        setCommandRunner(commandRunner as CommandRunner)
      } else {
        setCommandRunner(undefined)
      }
    })
    pet.on(HPetEventKeys.connectionStateChanged, setConnectionState)

    pet.start()

    return () => {
      // all event listeners will be automatically removed
      pet.stop()
      setCommandRunner(undefined)
    }
  }, [])

  return (
    <Box
      sx={{
        pt: 2,
        bgcolor: '#fff',
        '& .x_bottom_buttons': {
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          p: 0,
          height: 40,
          bgcolor: 'primary.main',
          color: '#fff',
          width: '100%',
          '&.x_connected': {
            bgcolor: 'success.main',
          },
          '&.x_disconnected': {
            bgcolor: 'primary.main',
          },
          '&.x_connecting': {
            bgcolor: '#e91e63',
          },
        },
      }}
    >
      <Box
        sx={{
          m: '0 auto',
          width: '100%',
          maxWidth: '100px',
          '& img': {
            width: '100%',
            height: 100,
            objectFit: 'contain',
          },
        }}
      >
        <img src={LOGO_IMG_URL} alt="" />
      </Box>
      <Typography
        variant="h6"
        sx={{
          textAlign: 'center',
          fontWeight: 700,
          color: '#000',
          mt: 1,
        }}
      >
        {HW_NAME.en}
      </Typography>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          p: 1,
        }}
      >
        <img src={BLUETOOTH_IMG_URL} alt="" width={24} height={24} />
      </Box>

      {connectionState === 'connected' && (
        <ButtonBase
          className="x_bottom_buttons x_connected"
          component="div"
          onClick={handleClickDisconnectBtn}
        >
          <span>Connected</span>
        </ButtonBase>
      )}

      {connectionState === 'disconnected' && (
        <ButtonBase
          className="x_bottom_buttons x_disconnected"
          component="div"
          onClick={handleClickConnectBtn}
        >
          <span>Disconnected</span>
        </ButtonBase>
      )}

      {connectionState === 'connecting' && (
        <Box className="x_bottom_buttons x_connecting">
          <span>Connecting...</span>
        </Box>
      )}
    </Box>
  )
}
