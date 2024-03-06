'use client'

import { CommandRunnerG3 } from '@/hw/CommandRunnerG3'
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
        <MainUi commandRunnerClass={CommandRunnerG3} cubeType="g3" logoImageUrl="logo_g3.png" />
      </Suspense>
    </Box>
  )
}
