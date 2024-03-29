'use client'

import MainUi from '@/ui/MainUi'
import { Suspense } from 'react'

export default function Page() {
  return (
    <Suspense>
      <MainUi />
    </Suspense>
  )
}
