'use client'

import { CommandRunnerG2 } from '@/hw/CommandRunnerG2'
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
        <MainUi commandRunnerClass={CommandRunnerG2} cubeType="g2" logoImageUrl="G2.png" />
      </Box>
    </Suspense>
  )
}
