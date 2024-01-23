'use client';

import config from '@/config';
import { HW_ID, HW_NAME } from '@/constant';
import { CommandRunner } from '@/hw/CommandRunner';
import { Box } from '@mui/material';
import { ConnectButton, HardwareImageBox, HardwareNameBox, MediaIconBox, usePet } from '@repo/ui';

const DEBUG = config.isDebug;

const LOGO_IMG_URL = 'logo.png';
const BLUETOOTH_IMG_URL = 'bluetooth.svg';

export default function Page() {
  const { commandRunner, connectionState, pet } = usePet(HW_ID, CommandRunner);

  // Click handler for the Connect button
  const handleClickConnectBtn = () => {
    const runner = commandRunner;
    if (!runner) return;
    runner.connect();
  };

  // Click handler for the Disconnect button
  const handleClickDisconnectBtn = () => {
    const runner = commandRunner;
    if (!runner) {
      return;
    }
    runner.disconnect();
  };

  return (
    <Box
      sx={{
        pt: 2,
        bgcolor: '#fff',
        '& .x_bottom_buttons': {
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          p: 0,
          height: 40,
          bgcolor: 'primary.main',
          color: '#fff',
          width: '100%',
          '&.x_connected': {
            bgcolor: 'success.main',
          },
          '&.x_disconnected': {
            bgcolor: 'primary.main',
          },
          '&.x_connecting': {
            bgcolor: '#e91e63',
          },
        },
      }}
    >
      <HardwareImageBox src={LOGO_IMG_URL} />
      <HardwareNameBox title={HW_NAME.en} />
      <MediaIconBox mediaIcon={BLUETOOTH_IMG_URL} />
      <ConnectButton
        connectionState={connectionState}
        onClickConnectBtn={handleClickConnectBtn}
        onClickDisconnectBtn={handleClickDisconnectBtn}
      />
    </Box>
  );
}
