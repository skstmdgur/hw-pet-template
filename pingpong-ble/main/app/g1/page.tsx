'use client'

import { CommandRunnerG1 } from '@/hw/CommandRunnerG1'
import MainUi from '@/ui/MainUi'
import { Box } from '@mui/material'
import { Suspense } from 'react'

import { useSearchParams } from 'next/navigation';

export default function Page() {

    const params= useSearchParams();

    console.log('Query parameters:', params.get('groupNumber'));

  return (
    <Box
      sx={{
        pt: 2,
        bgcolor: '#fff',
      }}
      style={{
          padding : 0
      }}
    >
      <Suspense>
        <MainUi commandRunnerClass={CommandRunnerG1} cubeType="g1" logoImageUrl="logo_g1.png" groupNumber={params.get('groupNumber')}/>
      </Suspense>
    </Box>
  )
}
