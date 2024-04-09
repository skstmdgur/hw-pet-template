import type { SxProps } from '@mui/material'
import { Typography } from '@mui/material'
import clsx from 'clsx'
import { flatSx } from '../util'

interface Props {
  sx?: SxProps
  className?: string
  style?: React.CSSProperties
  title: string
}

export function HardwareNameBox(props: Props) {
  const { sx, className, style, title } = props
  return (
    <Typography
      className={clsx('HardwareNameBox-root', className)}
      component="div"
      style={style}
      variant="h6"
      sx={flatSx(
        {
          textAlign: 'center',
          fontWeight: 700,
          fontSize: '1.1rem',
          height: 32,
          lineHeight: 1.2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#000',
          mt: 1,
        },
        sx,
      )}
    >
      {title}
    </Typography>
  )
}
