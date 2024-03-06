'use client'

import Link from 'next/link'

export default function Page() {
  return (
    <div
      style={{
        padding: '16px',
        background: '#fff',
      }}
    >
      <Link href="/g1" style={{ display: 'inline-block', padding: 16 }}>
        G1
      </Link>
      <Link href="/g2" style={{ display: 'inline-block', padding: 16 }}>
        G2
      </Link>
      <Link href="/g3" style={{ display: 'inline-block', padding: 16 }}>
        G3
      </Link>
      <Link href="/g4" style={{ display: 'inline-block', padding: 16 }}>
        G4
      </Link>
    </div>
  )
}
