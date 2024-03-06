import type { SxProps } from '@mui/material'
import { Typography } from '@mui/material'
import { flatSx } from '../util'
import clsx from 'clsx'

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
      sx={flatSx(
        {
          textAlign: 'center',
          fontWeight: 700,
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
