import { CommandRunnerBase } from './CommandRunnerBase'

/**
 * Inherits from the CommandRunnerBase class.
 * CommandRunnerBase handles the aspects related to the connection with hardware,
 * and this class handles the remaining commands that are sent to the hardware.
 */
export class CommandRunner extends CommandRunnerBase {
  async timeSleep(t: number): Promise<void> {
    await new Promise((resolve) => {
      setTimeout(resolve, t * 1000)
    })
  }

  private ipAddress: string | null = null

  // IP 주소를 설정하는 함수
  setIpAddress(ipAddress: string) {
    this.ipAddress = ipAddress
  }

  // IP 주소를 가져오는 함수
  getIpAddress(): string | null {
    return this.ipAddress
  }

  testConnect = async (ipAddress: string): Promise<boolean> => {
    if (!ipAddress) {
      console.error('IP address is required.')
      return false
    }

    // IP 주소 저장
    this.setIpAddress(ipAddress)

    try {
      const url = `http://${ipAddress}/connect`
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ port: '/dev/ttyUSB0' }), // JSON 데이터를 본문에 포함
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Response:', data)
      } else {
        console.error('Error:', response.statusText)
      }

      return true
    } catch (error) {
      console.error('Error connecting to device:', error)
      //this.updateConnectionState_('disconnected')
      return false
    }
  }

  testDisconnect = async (): Promise<boolean> => {
    if (!this.ipAddress) {
      console.error('IP address is not set.')
      return false
    }

    try {
      const url = `http://${this.ipAddress}/disconnect`
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ port: '/dev/ttyUSB0' }), // JSON 데이터를 본문에 포함
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Response:', data)
      } else {
        console.error('Error:', response.statusText)
      }

      return true
    } catch (error) {
      console.error('Error connecting to device:', error)
      //this.updateConnectionState_('disconnected')
      return false
    }
  }

  pose = async (): Promise<void> => {
    if (!this.ipAddress) {
      console.error('IP address is not set.')
      return
    }

    try {
      const url = `http://${this.ipAddress}/pose`
      const response = await fetch(url, {
        method: 'GET',
      })

      if (!response.ok) {
        console.error(`Failed to fetch pose: ${response.statusText}`)
        return
      }

      const responseData = await response.json()
      console.log('Pose Response:', responseData)
    } catch (error) {
      console.error('Error fetching pose:', error)
    }
  }

  moveRobot = async (x, y, z, r) => {
    if (!this.ipAddress) {
      console.error('IP address is not set.')
      return
    }

    try {
      const url = `http://${this.ipAddress}/move`
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          x: x,
          y: y,
          z: z,
          r: r,
          wait: true, // 기본값으로 설정
        }),
      })

      if (!response.ok) {
        console.error(`Failed to move robot: ${response.statusText}`)
        return false
      }

      const responseData = await response.json()
      console.log('Move Response:', responseData)
      return true
    } catch (error) {
      console.error('Error moving the robot:', error)
      return false
    }
  }

  suckOn = async (): Promise<void> => {
    if (!this.ipAddress) {
      console.error('IP address is not set.')
      return
    }

    try {
      const url = `http://${this.ipAddress}/suckOn`
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        console.error(`Failed to turn suction on: ${response.statusText}`)
        return
      }

      const responseData = await response.json()
      console.log('Suction On Response:', responseData)
    } catch (error) {
      console.error('Error turning suction on:', error)
    }
  }

  suckOff = async (): Promise<void> => {
    if (!this.ipAddress) {
      console.error('IP address is not set.')
      return
    }

    try {
      const url = `http://${this.ipAddress}/suckOff`
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        console.error(`Failed to turn suction off: ${response.statusText}`)
        return
      }

      const responseData = await response.json()
      console.log('Suction Off Response:', responseData)
    } catch (error) {
      console.error('Error turning suction off:', error)
    }
  }
}
