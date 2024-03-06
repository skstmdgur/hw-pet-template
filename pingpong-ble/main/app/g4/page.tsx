'use client'

import { CommandRunnerG4 } from '@/hw/CommandRunnerG4'
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
        <MainUi commandRunnerClass={CommandRunnerG4} cubeType="g4" logoImageUrl="logo_g4.png" />
      </Suspense>
    </Box>
  )
}
