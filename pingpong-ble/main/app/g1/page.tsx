'use client'

import { CommandRunnerG1 } from '@/hw/CommandRunnerG1'
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
        <MainUi commandRunnerClass={CommandRunnerG1} cubeType="g1" logoImageUrl="logo_g1.png" />
      </Suspense>
    </Box>
  )
}
