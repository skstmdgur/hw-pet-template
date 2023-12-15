'use client'

import { HW_ID, HW_NAME } from '@/constant'
import { CommandRunner } from '@/hw/CommandRunner'
import martyConnector from '@/hw/marty/MartyConnector'
import type { MartyConnectionState } from '@/hw/types'
import { errmsg } from '@/utls/misc'
import { HPet, HPetEventKeys } from '@ktaicoder/hw-pet'
import { Box, ButtonBase, Typography } from '@mui/material'
import { RICConnEvent } from '@robotical/ricjs'
import { useCallback, useEffect, useState } from 'react'
import LEDs from './components/hw/marty'
import log from '@/log'

const LOGO_IMG_URL = 'logo.png'
const BLUETOOTH_IMG_URL = 'bluetooth.svg'

export default function Page() {
  const [connectionState, setConnectionState] = useState<MartyConnectionState>('disconnected')
  const [randomColours, setRandomColours] = useState<string[]>([])
  const [commandRunner, setCommandRunner] = useState<CommandRunner>()

  const doConnect = useCallback(async (runner?: CommandRunner) => {
    if (!runner) return
    if (runner.NEEDS_VERIFICATION) {
      await runner.connect()
      await martyConnector.verifyMarty()
    } else {
      runner.connect()
    }
  }, [])

  // Click handler for the Connect button
  const handleClickConnectBtn = () => {
    doConnect(commandRunner)
  }

  // Click handler for the Disconnect button
  const handleClickDisconnectBtn = () => {
    const runner = commandRunner
    if (!runner) {
      return
    }
    runner.disconnect().catch((err) => {
      log.debug('ignore disconnect fail', errmsg(err))
    })
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

  // Create subscription to the marty connector state
  useEffect(() => {
    const martyConnectorSubscriptionHelper = {
      notify(
        eventType: string,
        eventEnum: RICConnEvent,
        eventName: string,
        eventData: string | object | null | undefined,
      ) {
        switch (eventType) {
          case 'conn':
            switch (eventEnum) {
              case RICConnEvent.CONN_VERIFYING_CORRECT_RIC:
                setRandomColours(eventData as string[])
                break

              default:
                break
            }
            break
        }
      },
    }

    // Subscribe
    martyConnector.subscribe(martyConnectorSubscriptionHelper, ['conn'])
    // Return unsubscribe function
    return () => {
      martyConnector.unsubscribe(martyConnectorSubscriptionHelper)
    }
  }, [])

  const handleClickVerifyBtn = () => {
    martyConnector.stopVerifyingMarty(true).catch((err) => {
      console.log('ignore error', errmsg(err))
    })
  }

  let connectedStateJSX = null
  if (commandRunner?.NEEDS_VERIFICATION) {
    connectedStateJSX = (
      <>
        <p className="x_verify_text">Look on Marty&apos;s back, is it displaying these lights?</p>
        <LEDs coloursArr={randomColours} />
        {!!(randomColours.length > 0) && (
          <div className="x_bottom_buttons_container">
            <ButtonBase
              className="x_bottom_buttons x_verify_no"
              component="div"
              onClick={handleClickDisconnectBtn}
            >
              <span>No</span>
            </ButtonBase>
            <ButtonBase
              className="x_bottom_buttons x_verify_yes"
              component="div"
              onClick={handleClickVerifyBtn}
            >
              <span>Yes</span>
            </ButtonBase>
          </div>
        )}
      </>
    )
  } else {
    connectedStateJSX = (
      <ButtonBase
        className="x_bottom_buttons x_connected"
        component="div"
        onClick={handleClickDisconnectBtn}
      >
        <span>Disconnect</span>
      </ButtonBase>
    )
  }

  return (
    <Box
      sx={{
        pt: 2,
        bgcolor: '#fff',
        '& .x_bottom_buttons_container': {
          display: 'flex',
          justifyContent: 'center',
          columnGap: 10,
          alignItems: 'center',
          p: 0,
          height: 40,
          color: '#fff',
          width: '100%',
          '& .x_verify_yes': {
            bgcolor: 'success.main',
          },
          '& .x_verify_no': {
            bgcolor: '#e91e63',
          },
        },
        '& .x_verify_text': {
          textAlign: 'center',
          fontWeight: 700,
          margin: '0',
          color: '#000',
          fontSize: 12,
          mt: 1,
        },
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

      {connectionState === 'verifying' && connectedStateJSX}

      {connectionState === 'connected' && (
        <ButtonBase
          className="x_bottom_buttons x_connected"
          component="div"
          onClick={handleClickDisconnectBtn}
        >
          <span>Disconnect</span>
        </ButtonBase>
      )}

      {connectionState === 'disconnected' && (
        <ButtonBase
          className="x_bottom_buttons x_disconnected"
          component="div"
          onClick={handleClickConnectBtn}
        >
          <span>Connect to Marty</span>
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
