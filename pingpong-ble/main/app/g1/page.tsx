'use client'

import { CommandRunnerG1 } from '@/hw/CommandRunnerG1'
import MainUi from '@/ui/MainUi'
import { Box } from '@mui/material'
import { Suspense } from 'react'

import { useSearchParams } from 'next/navigation';

export default function Page() {

    const params= useSearchParams();
    const groupNumber = params.get('groupNumber');
    console.log('Query parameters:', groupNumber);

  return (
      <Suspense>
          <Box
              sx={{
                  pt: 2,
                  bgcolor: '#fff',
              }}
              style={{
                  padding : 0
              }}
          >
              <MainUi commandRunnerClass={CommandRunnerG1} cubeType="g1" logoImageUrl="logo_g1.png" groupNumber={groupNumber}/>
          </Box>
      </Suspense>

  )
}
