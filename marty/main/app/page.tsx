'use client'

import { HW_ID } from '@/constant'
import { CommandRunner } from '@/hw/CommandRunner'
import type { ConnectionState } from '@ktaicoder/hw-pet'
import { HPet, HPetEvents } from '@ktaicoder/hw-pet'
import { Box, ButtonBase, Typography } from '@mui/material'
import { useEffect, useState } from 'react'

const LOGO_IMG_URL = 'logo.png'
const BLUETOOTH_IMG_URL = 'bluetooth.svg'

export default function Page() {
  const [connectionState, setConnectionState] =
    useState<ConnectionState>('disconnected')

  const [commandRunner, setCommandRunner] = useState<CommandRunner>()

  // 연결하기 버튼 클릭 핸들러
  const handleClickConnectBtn = () => {
    const runner = commandRunner
    if (!runner) return
    runner.connect()
  }

  // 연결 끊기 버튼 클릭 핸들러
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

    pet.once(HPetEvents.COMMAND_RUNNER_STARTED, (runner: CommandRunner) => {
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
        Marty
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
