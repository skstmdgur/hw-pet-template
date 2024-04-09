import { Box } from '@mui/material'
import React from 'react'

const IFRAME_SIZE = {
  width: 260,
  height: 244,
}

export function DevIframeContainer(props: {
  hideDevOutline?: boolean
  children?: React.ReactNode
}) {
  const { hideDevOutline, children } = props

  return hideDevOutline ? (
    children
  ) : (
    <Box
      className="DevIframeContainer-root"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '100vw',
      }}
    >
      <Box
        sx={{
          height: IFRAME_SIZE.height,
          width: IFRAME_SIZE.width,
          border: '1px solid #ddd',
        }}
      >
        {children}
      </Box>
    </Box>
  )
}
