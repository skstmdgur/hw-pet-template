import type { SxProps } from '@mui/material';
import { Box } from '@mui/material';
import clsx from 'clsx';
import { flatSx } from '../util';

interface Props {
  sx?: SxProps;
  className?: string;
  style?: React.CSSProperties;
  src: string;
}

export function HardwareImageBox(props: Props) {
  const { sx, className, style, src } = props;
  return (
    <Box
      className={clsx('HardwareImageBox-root', className)}
      style={style}
      sx={flatSx(
        {
          width: '100%',
          maxWidth: '100%',
          height: 80,
          display: 'flex',
          justifyContent: 'center',
          '& img': {
            height: 80,
            objectFit: 'contain',
          },
        },
        sx,
      )}
    >
      <img alt="" src={src} />
    </Box>
  );
}
