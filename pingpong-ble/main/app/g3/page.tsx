'use client'

import { CommandRunnerG3 } from '@/hw/CommandRunnerG3'
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
              <Suspense>
                  <MainUi commandRunnerClass={CommandRunnerG3} cubeType="g3" logoImageUrl="logo_g3.png" groupNumber={groupNumber}/>
              </Suspense>
          </Box>
      </Suspense>

  )
}
