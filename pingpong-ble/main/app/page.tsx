'use client'

import Link from 'next/link'
import React, { useState } from 'react';

export default function Page() {

  const [selectedNumber1, setSelectedNumber1] = useState('0');
  const [selectedNumber2, setSelectedNumber2] = useState('0');

  const handleChangeNumber1 = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedNumber1(e.target.value);
  };

  const handleChangeNumber2 = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedNumber2(e.target.value);
  };

  const combinedValue = selectedNumber1 + selectedNumber2;

  return (
      <div
          style={{
              padding: '16px',
              background: '#fff',
          }}
      >
          <div>
              <h4 style={{
                  textAlign: 'center',
                  margin: 0
              }}>그룹번호 설정</h4>
              <div style={{
                  textAlign: 'center'
              }}>
                  <select
                      style={{
                          border: 'none',
                          height: '30px',
                          fontSize: '25px',
                          background: '#ffd558',
                          borderRadius: '8px'
                      }}
                      onChange={handleChangeNumber1}>
                      {[...Array(10).keys()].map((number) => (
                          <option key={number} value={number}>
                              {number}
                          </option>
                      ))}
                  </select>
                  <select
                      style={{
                          border: 'none',
                          height: '30px',
                          fontSize: '25px',
                          background: '#ffd558',
                          borderRadius: '8px'
                      }}
                      onChange={handleChangeNumber2}>
                      {[...Array(10).keys()].map((number) => (
                          <option key={number} value={number}>
                              {number}
                          </option>
                      ))}
                  </select>
              </div>

          </div>
          <Link href={`/g1?groupNumber=${combinedValue}`} style={{display: 'inline-block', padding: 16}}>
              <img
                  style={{
                      width: '70px'
                  }}
                  src='logo_g1.png'/>
          </Link>
          <Link href={`/g2?groupNumber=${combinedValue}`} style={{display: 'inline-block', padding: 16}}>
              <img
                  style={{
                      width: '70px'
                  }}
                  src='logo_g2.png'/>
          </Link>
          <Link href={`/g3?groupNumber=${combinedValue}`} style={{display: 'inline-block', padding: 16}}>
              <img
                  style={{
                      width: '70px'
                  }}
                  src='logo_g3.png'/>
          </Link>
          <Link href={`/g4?groupNumber=${combinedValue}`} style={{display: 'inline-block', padding: 16}}>
              <img
                  style={{
                      width: '70px'
                  }}
                  src='logo_g4.png'/>
          </Link>
      </div>
  )
}
