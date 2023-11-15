'use client'

import type { ConnectionState } from '@ktaicoder/hw-pet'
import { HPet, HPetEvents } from '@ktaicoder/hw-pet'
import { Box, ButtonBase, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { MartyCommands } from '../src/hw/MartyCommands'
import { HW_ID } from './constant'

export default function Page() {
  const [connectionState, setConnectionState] =
    useState<ConnectionState>('disconnected')

  const [commandRunner, setCommandRunner] = useState<MartyCommands>()

  // 연결하기 버튼 클릭
  const handleClickConnectBtn = () => {
    const runner = commandRunner
    if (!runner) return
    runner.connect()
  }

  // 연결 끊기 버튼 클릭
  const handleClickDisconnectBtn = () => {
    const runner = commandRunner
    if (!runner) {
      alert(1)
      return
    }
    runner.disconnect()
  }

  useEffect(() => {
    const pet = new HPet({
      hwId: HW_ID,
      commandRunnerClass: MartyCommands,
    })

    pet.once(HPetEvents.COMMAND_RUNNER_STARTED, (runner: MartyCommands) => {
      console.log(HPetEvents.COMMAND_RUNNER_STARTED, runner)
      setCommandRunner(runner)
      pet.on(HPetEvents.CONNECTION_STATE_CHANGED, setConnectionState)
    })

    pet.on(HPetEvents.COMMAND_RUNNER_STOPPED, () => {
      setCommandRunner(undefined)
    })

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
          height: 100,
          '& img': {
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          },
        }}
      >
        <img src="/marty_v2.webp" alt="" />
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
        Marty
      </Typography>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          p: 1,
          '& img': {
            width: '24px',
          },
        }}
      >
        <img src="/bluetooth.svg" alt="" />
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
