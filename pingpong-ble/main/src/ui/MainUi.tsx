'use client'

import { HW_ID, HW_NAME } from '@/constant'
import type { CubeType } from '@/types'
import type { HPetCommandRunnerClassType } from '@ktaicoder/hw-pet'
import { Box } from '@mui/material'
import { ConnectButton, HardwareImageBox, HardwareNameBox, MediaIconBox, usePet } from '@repo/ui'

const MEDIA_ICON = 'bluetooth.svg'

interface Props {
  cubeType: CubeType
  commandRunnerClass: HPetCommandRunnerClassType<any>
  logoImageUrl: string
}

export default function MainUi(props: Props) {
  const { commandRunnerClass, cubeType, logoImageUrl } = props
  const { commandRunner, connectionState, pet } = usePet(HW_ID, commandRunnerClass)

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
      <HardwareImageBox src={logoImageUrl} />
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
