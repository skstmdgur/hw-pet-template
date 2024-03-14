'use client'

import { HW_ID, HW_NAME } from '@/constant'
import type { CubeType } from '@/types'
import type { HPetCommandRunnerClassType } from '@ktaicoder/hw-pet'
import { Box } from '@mui/material'
import { ConnectButton, HardwareImageBox, HardwareNameBox, MediaIconBox, usePet } from '@repo/ui'
import React, {useState} from "react";

const MEDIA_ICON = 'bluetooth.svg'

interface Props {
  cubeType: CubeType
  commandRunnerClass: HPetCommandRunnerClassType<any>
  logoImageUrl: string
  groupNumber : string
}

export default function MainUi(props: Props) {
  const { commandRunnerClass, cubeType, logoImageUrl , groupNumber} = props
  const { commandRunner, connectionState, pet } = usePet(HW_ID, commandRunnerClass)

    const [selectGroupNumber, setSelectGroupNumber] = useState(groupNumber); // 기본값은 두 자리의 0으로 설정
  console.log(selectGroupNumber)
  // Click handler for the Connect button
  const handleClickConnectBtn = () => {
    const runner = commandRunner
    if (!runner) return
    runner.groupNumber = selectGroupNumber
    runner.connect()
  }

  // Click handler for the Disconnect button
  const handleClickDisconnectBtn = () => {
    const runner = commandRunner
    if (!runner) {
      return
    }
    runner.disconnect()
  }


  const handleChangeNumber1 = (e) => {
    const selectedValue = e.target.value;
    setSelectGroupNumber(selectedValue + selectGroupNumber.charAt(1)); // 첫 번째 자리만 업데이트
  };
  const handleChangeNumber2 = (e) => {
    const selectedValue = e.target.value;
    setSelectGroupNumber(selectGroupNumber.charAt(0) + selectedValue); // 두 번째 자리만 업데이트
  };

  return (
      <Box
          sx={{
            pt: 2,
            bgcolor: '#fff',

          }}
          style={{
              padding : 0
          }}
      >
        <div>
            <h4 style={{
                textAlign: 'center',
                margin: 0
            }}>그룹번호 설정</h4>
            <div style={{
                textAlign: 'center',
            }}>
                <select
                    onChange={handleChangeNumber1}
                    value={selectGroupNumber.charAt(0)}
                    style={{
                        border: 'none',
                        height: '30px',
                        fontSize: '25px',
                        background: '#ffd558',
                        borderRadius: '8px'
                    }}>
                    {[...Array(10).keys()].map((number) => (
                        <option key={number} value={number}>
                            {number}
                        </option>
                    ))}
                </select>
                <select
                    onChange={handleChangeNumber2}
                    value={selectGroupNumber.charAt(1)}
                    style={{
                        border: 'none',
                        height: '30px',
                        fontSize: '25px',
                        background: '#ffd558',
                        borderRadius: '8px'
                    }}>
                    {[...Array(10).keys()].map((number) => (
                        <option key={number} value={number}>
                            {number}
                        </option>
                    ))}
                </select>
            </div>

        </div>
          <HardwareImageBox src={logoImageUrl}/>
          <HardwareNameBox title={HW_NAME.en}/>
          <MediaIconBox mediaIcon={MEDIA_ICON}/>
          <ConnectButton
              connectionState={connectionState}
              onClickConnectBtn={handleClickConnectBtn}
              onClickDisconnectBtn={handleClickDisconnectBtn}
          />
      </Box>
  )
}
