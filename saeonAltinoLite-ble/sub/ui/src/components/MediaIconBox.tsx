import type { SxProps } from '@mui/material';
import { Stack } from '@mui/material';
import clsx from 'clsx';
import React from 'react';
import { flatSx } from '../util';

interface Props {
  sx?: SxProps;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  mediaIcon: string;
}

export function MediaIconBox(props: Props) {
  const { sx, className, style, mediaIcon, children } = props;
  return (
    <Stack
      alignItems="center"
      className={clsx('MediaIconBox-root', className)}
      direction="row"
      justifyContent="center"
      spacing={1}
      style={style}
      sx={flatSx({ height: 44 }, sx)}
    >
      <img alt="" height={24} src={mediaIcon} width={24} />
      {children}
    </Stack>
  );
}
