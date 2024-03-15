'use client'

import { CommandRunnerG2 } from '@/hw/CommandRunnerG2'
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
        <Suspense>
          <MainUi
            commandRunnerClass={CommandRunnerG2}
            cubeType="g2"
            groupNumber={groupNumber}
            logoImageUrl="logo_g2.png"
          />
        </Suspense>
      </Box>
    </Suspense>
  )
}
