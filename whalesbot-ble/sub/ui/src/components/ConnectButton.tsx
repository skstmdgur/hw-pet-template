import type { ConnectionState } from '@ktaicoder/hw-pet';
import type { SxProps } from '@mui/material';
import { Box, ButtonBase } from '@mui/material';
import { clsx } from 'clsx';
import { flatSx } from '../util';

interface Props {
  sx?: SxProps;
  className?: string;
  style?: React.CSSProperties;
  connectionState: ConnectionState;
  onClickDisconnectBtn: React.MouseEventHandler;
  onClickConnectBtn: React.MouseEventHandler;
}

export function ConnectButton(props: Props) {
  const { sx, className, style, connectionState, onClickConnectBtn, onClickDisconnectBtn } = props;

  return (
    <>
      {connectionState === 'connected' && (
        <ButtonBase
          className={clsx('ConnectButton-root x_connected', className)}
          component="div"
          onClick={onClickDisconnectBtn}
          style={style}
          sx={flatSx(rootSx, sx)}
        >
          <span>Connected</span>
        </ButtonBase>
      )}

      {connectionState === 'disconnected' && (
        <ButtonBase
          className={clsx('ConnectButton-root x_disconnected', className)}
          component="div"
          onClick={onClickConnectBtn}
          style={style}
          sx={flatSx(rootSx, sx)}
        >
          <span>Disconnected</span>
        </ButtonBase>
      )}

      {connectionState === 'connecting' && (
        <Box
          className={clsx('ConnectButton-root x_connecting', className)}
          style={style}
          sx={flatSx(rootSx, sx)}
        >
          <span>Connecting...</span>
        </Box>
      )}
    </>
  );
}

const rootSx: SxProps = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: 40,
  mx: 'auto',
  mt: 1,
  bgcolor: 'primary.main',
  color: '#fff',
  boxShadow: 3,
  maxWidth: 200,
  borderRadius: 1,
  fontWeight: 400,
  fontSize: '1.1rem',
  '&.x_connected': {
    bgcolor: 'primary.main',
    borderRadius: '20px / 50%',
    fontWeight: 500,
    fontSize: '1.15rem',
    position: 'relative',
    '&::before': {
      position: 'absolute',
      top: '50%',
      right: 12,
      transform: 'translateY(-50%)',
      content: '"×"',
      fontSize: '0.9rem',
    },
  },
  '&.x_disconnected': {
    bgcolor: 'secondary.main',
    position: 'relative',
    '&::before': {
      position: 'absolute',
      top: '50%',
      right: 12,
      transform: 'translateY(-50%)',
      content: '"☝"',
      fontSize: '0.9rem',
    },
  },
  '&.x_connecting': {
    bgcolor: '#e91e63',
    borderRadius: 1,
    boxShadow: 'none',
    maxWidth: '90%',
  },
};
