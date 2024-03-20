'use client'

import Link from 'next/link'
import React, { Suspense, useEffect, useState } from 'react'

export default function Page() {
  const [selectedNumber1, setSelectedNumber1] = useState('0')
  const [selectedNumber2, setSelectedNumber2] = useState('0')

  const handleChangeNumber1 = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedNumber1(e.target.value)
  }

  const handleChangeNumber2 = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedNumber2(e.target.value)
  }

  const [checked, setChecked] = useState(false)

  useEffect(() => {
    if (selectedNumber1 == selectedNumber2) {
      if (selectedNumber1 != '0') {
        setChecked(true)
        setSelectedNumber1('0')
        setSelectedNumber2('0')
      }
    }
  })

  const [clicked, setClicked] = useState(false)

  const handleClick = () => {
    setClicked(true)
  }

  const handleCloseModal = () => {
    setClicked(false)
    setChecked(false)
  }

  const combinedValue = selectedNumber1 + selectedNumber2

  return (
    <Suspense>
      <div
        style={{
          padding: '16px',
          background: '#fff',
        }}
      >
        {/* <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            {clicked && (
              <div
                style={{
                  position: 'fixed',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  background: 'rgba(0, 0, 0, 0.8)',
                  color: '#fff',
                  padding: '5px',
                  borderRadius: '10px',
                  zIndex: '9999',
                  width: '200px',
                }}
                onClick={handleCloseModal}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: '15px',
                    fontWeight: 'bold',
                    textAlign: 'center',
                  }}
                >
                  * 그룹번호 설명 *
                </p>
                <p
                  style={{
                    fontSize: '14px',
                  }}
                >
                  연결하려는 큐브의 블루투스 그룹번호를 설정하는 메뉴입니다. 동일한 앞뒤 번호는
                  설정할 수 없습니다.
                </p>
              </div>
            )}
            {checked && (
              <div
                style={{
                  position: 'fixed',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  background: 'rgba(0, 0, 0, 0.8)',
                  color: '#fff',
                  padding: '5px',
                  borderRadius: '10px',
                  zIndex: '9999',
                  width: '200px',
                }}
                onClick={handleCloseModal}
              >
                <p
                  style={{
                    fontSize: '14px',
                  }}
                >
                  동일한 앞뒤 번호는 설정할 수 없습니다.
                </p>
              </div>
            )}
            <h4
              style={{
                textAlign: 'center',
                margin: 0,
              }}
            >
              그룹번호 설정
            </h4>
            <div
              style={{
                background: '#ffd558',
                color: '#2d2d2a',
                borderRadius: '50px',
                width: '20px',
                textAlign: 'center',
                height: '20px',
                fontWeight: 'bold',
                marginLeft: '5px',
                cursor: 'pointer',
              }}
              onClick={handleClick}
            >
              ?
            </div>
          </div>
          <div
            style={{
              textAlign: 'center',
            }}
          >
            <select
              value={selectedNumber1}
              style={{
                border: 'none',
                height: '30px',
                fontSize: '25px',
                background: '#ffd558',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
              onChange={handleChangeNumber1}
            >
              {[...Array(8).keys()].map((number) => (
                <option key={number} value={number}>
                  {number}
                </option>
              ))}
            </select>
            <select
              value={selectedNumber2}
              style={{
                border: 'none',
                height: '30px',
                fontSize: '25px',
                background: '#ffd558',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
              onChange={handleChangeNumber2}
            >
              {[...Array(8).keys()].map((number) => (
                <option key={number} value={number}>
                  {number}
                </option>
              ))}
            </select>
          </div>
        </div> */}
        <Link
          href={`/g1?groupNumber=${combinedValue}`}
          style={{ display: 'inline-block', padding: 16 }}
        >
          <img
            style={{
              width: '170px',
              borderRadius: '10px',
            }}
            src="G1_logo.jpg"
          />
        </Link>
        <Link
          href={`/g2?groupNumber=${combinedValue}`}
          style={{ display: 'inline-block', padding: 16 }}
        >
          <img
            style={{
              width: '170px',
              borderRadius: '10px',
            }}
            src="G2_logo.jpg"
          />
        </Link>
        <Link
          href={`/g3?groupNumber=${combinedValue}`}
          style={{ display: 'inline-block', padding: 16 }}
        >
          <img
            style={{
              width: '170px',
              borderRadius: '10px',
            }}
            src="G3_logo.jpg"
          />
        </Link>
        <Link
          href={`/g4?groupNumber=${combinedValue}`}
          style={{ display: 'inline-block', padding: 16 }}
        >
          <img
            style={{
              width: '170px',
              borderRadius: '10px',
            }}
            src="G4_logo.jpg"
          />
        </Link>
      </div>
    </Suspense>
  )
}
