import type { SxProps } from '@mui/material';
import { Typography } from '@mui/material';
import { flatSx } from '../util';
import clsx from 'clsx';

interface Props {
  sx?: SxProps;
  className?: string;
  style?: React.CSSProperties;
  title: string;
  version: string;
}

export function HardwareNameBox(props: Props) {
  const { sx, className, style, title, version } = props;
  return (
    <div>
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
      <Typography sx={flatSx(
        {
          height: 0,
          display: 'flex',
          alignItems: 'right',
          justifyContent: 'right',
          color: '#ccc',
          mr: 2,

        }, sx,)}>{version}</Typography>
    </div>
    
  );
}
