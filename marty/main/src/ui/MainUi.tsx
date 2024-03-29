'use client'

import { ConnectButton } from '@/components/ConnectButton'
import { DevIframeContainer } from '@/components/DevIframeContainer'
import { HardwareImageBox } from '@/components/HardwareImageBox'
import { HardwareNameBox } from '@/components/HardwareNameBox'
import { MartyNeedVerification } from '@/components/MartyNeedVerification'
import { MediaIconBox } from '@/components/MediaIconBox'
import { HW_ID, HW_NAME } from '@/constant'
import { useConnectionVerifyingCorrectRIC } from '@/hooks/useConnectionVerifyingCorrectRIC'
import { usePet } from '@/hooks/usePet'
import { CommandRunner } from '@/hw/CommandRunner'
import martyConnector from '@/hw/marty/MartyConnector'
import log from '@/log'
import { errmsg } from '@/util/misc'
import { Box } from '@mui/material'
import { useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

const LOGO_IMG_URL = 'logo.png'
const BLUETOOTH_IMG_URL = 'bluetooth.svg'

export default function MainUi() {
  const searchParams = useSearchParams()
  const { randomColours } = useConnectionVerifyingCorrectRIC()
  const { pet, commandRunner, connectionState } = usePet(HW_ID, CommandRunner, searchParams)

  // connect to hardware
  const doConnect = useCallback(async (runner: CommandRunner) => {
    if (runner.NEEDS_VERIFICATION) {
      await runner.connect()
      await martyConnector.verifyMarty()
    } else {
      runner.connect()
    }
  }, [])

  // Click handler for the Connect button
  const handleClickConnectBtn = () => {
    if (!commandRunner) return
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

  // Click handler for the verify yes button
  const handleClickVerifyYesBtn = () => {
    martyConnector.stopVerifyingMarty(true).catch((err) => {
      console.log('ignore error', errmsg(err))
    })
  }

  return (
    <DevIframeContainer hideDevOutline>
      <Box
        sx={{
          position: 'relative',
          pt: 2,
          bgcolor: '#fff',
        }}
      >
        <HardwareImageBox src={LOGO_IMG_URL} />
        <HardwareNameBox title={HW_NAME.en} />
        <MediaIconBox mediaIcon={BLUETOOTH_IMG_URL} />

        {connectionState === 'verifying' ? (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              pt: 1,
              px: 2,
              bgcolor: 'rgba(255, 255, 255, 1)',
            }}
          >
            <MartyNeedVerification
              randomColours={randomColours}
              onClickYes={handleClickVerifyYesBtn}
              onClickNo={handleClickDisconnectBtn}
            />
          </Box>
        ) : (
          <ConnectButton
            connectionState={connectionState}
            onClickConnectBtn={handleClickConnectBtn}
            onClickDisconnectBtn={handleClickDisconnectBtn}
            connectButtonTitle="Connect to Marty"
            connectedButtonTitle="Connected"
          />
        )}
      </Box>
    </DevIframeContainer>
  )
}
