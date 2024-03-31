'use client'

import { CommandRunnerG4 } from '@/hw/CommandRunnerG4'
import MainUi from '@/ui/MainUi'
import { Box } from '@mui/material'
import { Suspense } from 'react'

import { useSearchParams } from 'next/navigation'

export default function Page() {
  const params = useSearchParams()

  return (
    <Suspense>
      <Box
        style={{
          padding: 0,
        }}
        sx={{
          pt: 2,
          bgcolor: '#fff',
        }}
      >
        <MainUi
          commandRunnerClass={CommandRunnerG4}
          cubeType="g4"
          logoImageUrl="G4.png"
        />
      </Box>
    </Suspense>
  )
}
