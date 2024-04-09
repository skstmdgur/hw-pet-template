import { Box, ButtonBase, Stack, Typography } from '@mui/material'
import LEDs from './LEDs'

export function MartyNeedVerification(props: {
  randomColours: string[]
  onClickYes: React.MouseEventHandler
  onClickNo: React.MouseEventHandler
}) {
  const { randomColours, onClickYes, onClickNo } = props
  return (
    <Box
      className="MartyNeedVerification-root"
      sx={{
        position: 'relative',
        '& .MartyNeedVerification-btn': {
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: '16px/50%',
          p: 0,
          height: 36,
          color: '#fff',
          width: '100%',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          '& img': {
            maxWidth: '100%',
            height: 80,
            objectFit: 'contain',
          },
        }}
      >
        <img src="marty_back_side.png" alt="" />
      </Box>
      <Typography
        sx={{
          mt: 1,
          textAlign: 'center',
          fontWeight: 700,
          color: '#000',
          fontSize: 12,
        }}
      >
        Look on Marty&apos;s back, is it displaying these lights?
      </Typography>
      <Box mt={1}>
        <LEDs coloursArr={randomColours} />
      </Box>
      {randomColours.length > 0 && (
        <Stack direction="row" spacing={1} alignItems="center" mt={1}>
          <ButtonBase
            className="MartyNeedVerification-btn"
            component="div"
            onClick={onClickNo}
            sx={{
              bgcolor: '#e91e63',
            }}
          >
            <span>No</span>
          </ButtonBase>
          <ButtonBase
            className="MartyNeedVerification-btn"
            component="div"
            onClick={onClickYes}
            sx={{
              bgcolor: 'primary.main',
            }}
          >
            <span>Yes</span>
          </ButtonBase>
        </Stack>
      )}
    </Box>
  )
}
