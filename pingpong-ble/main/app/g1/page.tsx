'use client'

import { CommandRunnerG1 } from '@/hw/CommandRunnerG1'
import MainUi from '@/ui/MainUi'
import { Box } from '@mui/material'
import { Suspense } from 'react'

import { useSearchParams } from 'next/navigation'

export default function Page() {
  const params = useSearchParams()
  const groupNumber = params.get('groupNumber')
  // console.log('Query parameters:', groupNumber);

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
          commandRunnerClass={CommandRunnerG1}
          cubeType="g1"
          groupNumber={groupNumber}
          logoImageUrl="logo_g1.png"
        />
      </Box>
    </Suspense>
  )
}
