'use client'

import Link from 'next/link'
import React, { Suspense, useEffect, useState } from 'react'

export default function Page() {

  const combinedValue = '0'+'0'

  return (
    <Suspense>
      <div
        style={{
          padding: '16px',
          background: '#fff',
        }}
      >
        <Link
          href={`/g1?groupNumber=${combinedValue}`}
          style={{ display: 'inline-block', padding: 16 }}
        >
          <img
            style={{
              width: '170px',
              borderRadius: '10px',
            }}
            src="pingpong1.png"
          />
        </Link>
        <Link
          href={`/g2?groupNumber=${combinedValue}`}
          style={{ display: 'inline-block', padding: 16 }}
        >
          <img
            style={{
              width: '170px',
              borderRadius: '10px',
            }}
            src="pingpong2.png"
          />
        </Link>
        <Link
          href={`/g3?groupNumber=${combinedValue}`}
          style={{ display: 'inline-block', padding: 16 }}
        >
          <img
            style={{
              width: '170px',
              borderRadius: '10px',
            }}
            src="pingpong3.png"
          />
        </Link>
        <Link
          href={`/g4?groupNumber=${combinedValue}`}
          style={{ display: 'inline-block', padding: 16 }}
        >
          <img
            style={{
              width: '170px',
              borderRadius: '10px',
            }}
            src="pingpong4.png"
          />
        </Link>
      </div>
    </Suspense>
  )
}
