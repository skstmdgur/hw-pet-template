'use client';

import config from '@/config';
import { HW_ID, HW_NAME } from '@/constant';
import { CommandRunner } from '@/hw/CommandRunner';
import { Box } from '@mui/material';
import { ConnectButton, HardwareImageBox, HardwareNameBox, MediaIconBox, usePet } from '@repo/ui';
import proInfo from '../../package.json'

const DEBUG = config.isDebug;

const LOGO_IMG_URL = 'logo.png';
const MEDIA_ICON = 'bluetooth.svg';

export default function Page() {
  const { commandRunner, connectionState, pet } = usePet(HW_ID, CommandRunner);

  // Click handler for the Connect button
  const handleClickConnectBtn = () => {
    console.log('Page handleClickConnectBtn');
    const runner = commandRunner;
    if (!runner) return;
    runner.connect();
  };

  // Click handler for the Disconnect button
  const handleClickDisconnectBtn = () => {
    console.log('Page handleClickDisconnectBtn');
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
      }}
    >
      <HardwareImageBox src={LOGO_IMG_URL} />
      <HardwareNameBox title={HW_NAME.en} version={'v'+proInfo.version} />
      <MediaIconBox mediaIcon={MEDIA_ICON} />
      <ConnectButton
        connectionState={connectionState}
        onClickConnectBtn={handleClickConnectBtn}
        onClickDisconnectBtn={handleClickDisconnectBtn}
      />
    </Box>
  );
}
