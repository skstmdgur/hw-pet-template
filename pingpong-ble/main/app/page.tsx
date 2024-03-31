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
        <img
          style={{
            width: '170px',
            borderRadius: '10px',
          }}
          src="pingpong1.png"
        />
      </Link>
      <Link href="/g2" style={{ display: 'inline-block', padding: 16 }}>
        <img
          style={{
            width: '170px',
            borderRadius: '10px',
          }}
          src="pingpong2.png"
        />
      </Link>
      <Link href="/g3" style={{ display: 'inline-block', padding: 16 }}>
        <img
          style={{
            width: '170px',
            borderRadius: '10px',
          }}
          src="pingpong3.png"
        />
      </Link>
      <Link href="/g4" style={{ display: 'inline-block', padding: 16 }}>
        <img
          style={{
            width: '170px',
            borderRadius: '10px',
          }}
          src="pingpong4.png"
        />
      </Link>
    </div>
  )
}
