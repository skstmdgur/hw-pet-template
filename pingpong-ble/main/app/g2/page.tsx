'use client'

import { CommandRunnerG2 } from '@/hw/CommandRunnerG2'
import MainUi from '@/ui/MainUi'
import { Box } from '@mui/material'
import { Suspense } from 'react'

export default function Page() {
  return (
    <Box
      sx={{
        pt: 2,
        bgcolor: '#fff',
      }}
    >
      <Suspense>
        <MainUi commandRunnerClass={CommandRunnerG2} cubeType="g2" logoImageUrl="logo_g2.png" />
      </Suspense>
    </Box>
  )
}
