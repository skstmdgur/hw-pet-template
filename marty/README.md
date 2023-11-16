# Marty

![Marty](./main/public/logo.png)

Marty

## Technical stacks

- @robotical/ricjs@1.6.4
- nodejs@20
- nextjs@13
- react@18
- worspace with turborepo
- pnpm
- typescript@^4.9.5
- @mui/material@5

## 빌드 및 실행

```sh
pnpm install

# run dev mode
pnpm dev

# open http://localhost:3000
```

## 몇 가지 명령어 예시

```js
// rest
hw.sendREST('traj/circle') // duration=3000
hw.sendREST('traj/kick') // duration=3000
hw.sendREST('traj/dance') // duration=4000
hw.sendREST('traj/wiggle') // duration=4700
hw.sendREST('traj/eyesWide') // duration=1200
hw.sendREST('traj/eyesNormal') // duration=1200
hw.sendREST('pwrctrl/5von')
hw.sendREST('pwrctrl/5voff')

// sounds
hw.streamSoundFile('completed_tone_low_br.mp3')
hw.streamSoundFile('test440ToneQuietShort.mp3')
hw.streamSoundFile('unplgivy.mp3')

// files
hw.sendFile('soundtest_44100_48kbps.mp3')
hw.sendFile('soundtest_44100_192kbps.mp3')
hw.sendFile('unplgivy.mp3')

// etc
hw.startCheckCorrectRIC()
hw.acceptCheckCorrectRIC()
hw.rejectCheckCorrectRIC()
```

## 폴더 구조

- `main`
  - 코디니 서비스에서 임베딩할 iframe의 내용을 담고 있습니다.
  - NextJS로 작성된 웹 페이지의 소스 코드를 포함합니다.
- `sub/eslint-config-custom`
  - eslint 설정을 포함하고 있습니다.
- `sub/tsconfig`
  - typescript 설정을 포함하고 있습니다.

## 수정할 소스 코드

sub 폴더는 수정할 필요가 없습니다. 수정이 필요한 부분은 main 폴더의 소스코드입니다. 하나씩 수정할 부분을 살펴보겠습니다.

### 로고 파일

- 로고파일을 교체하기 위해서 아래의 경로에 파일을 저장하세요. 파일명은 `logo.png` 로 작성해주세요.
  - `main/public/logo.png`
  - 로고 파일의 크기는 높이는 `200px`로 고정입니다. 이미지의 너비는 `150~300px`이 적당합니다.

### 하드웨어 ID 및 이름 설정

- `main/src/constant.ts` 파일을 수정해주세요.

```js
// file: src/constant.ts

/**
 * hardware id
 */
export const HW_ID = 'marty'

/**
 * hardware name
 */
export const HW_NAME = {
  en: 'Marty',
  ko: '마티',
}
```

### 연결 및 명령 추가

- `CommandRunner.ts` 파일에 연결 및 제어 명령과 관련된 내용이 포함되어 있습니다. 이 파일을 수정하여 추가 명령어들을 작성해주세요.

아래는 반드시 구현해야 하는 최소 내용을 정리했습니다.

```js
// file: main/src/hw/CommandRunner.ts

/**
 * Class for sending commands to the hardware.
 * Add the necessary commands here.
 * Write the method names the same as the commands.
 *
 * Lifecycle methods: init(), destroy()
 * Mandatory implementation methods: getConnectionState(), getHwId(), connect(), disconnect()
 * Additional commands are the remaining methods other than the ones mentioned above (e.g., sendRICRESTMsg).
 */
export class CommandRunner implements IHPetCommandRunner {
  /**
   * Lifecycle function, Automatically called.
   * An essential function that must be implemented.
   * Called once before communicating with parent frame (CODINY).
   * Initialization tasks, such as registering event listeners, can be performed here.
   */
  init = async (): Promise<void> => {
    // ...
  }

  /**
   * Lifecycle function, Automatically called.
   * An essential function that must be implemented.
   * Called once after the connection with the hardware is terminated.
   * Cleanup tasks, such as unregistering event listeners, can be performed here.
   */
  destroy = async () => {
    // ...
  }


  /**
   * command: getConnectionState
   *
   * get current connection state
   * An essential function that must be implemented.
   * The return value is automatically sent to the parent frame (CODINY)
   * @returns ConnectionState - connection state
   */
  getConnectionState = async (): Promise<ConnectionState> => {
    // ...
  }

  /**
   * command: getHwId
   *
   * get hardware id
   * An essential function that must be implemented.
   * The return value is automatically sent to the parent frame (CODINY)
   * @returns string - hwId
   */
  getHwId = async (): Promise<string> => {
    // ...
  }

  /**
   * command: connect
   * Function to connect to the hardware.
   * Check the connection status in ricConnector.setEventListener().
   * An essential function that must be implemented.
   * @returns The return value is meaningless.
   */
  connect = async (): Promise<boolean> => {
    // ...
  }

  /**
   * command: disconnect
   *
   * Function to disconnect from the hardware.
   * An essential function that must be implemented.
   * @returns The return value is meaningless.
   */
  disconnect = async () => {
    // ...
  }

}

```

#### 연결 상태 리스너

- 연결 상태 리스너와 같은 이벤트 리스너들은 `init()`에서 등록하는 것이 좋습니다.
- 이벤트 리스너의 등록을 해제할 때는 `destroy()`에서 작성하세요.
- 예를 들면, 아래와 같이 할 수 있습니다.

```js
export class CommandRunner implements IHPetCommandRunner {
  // ...

  init = async (): Promise<void> => {
    this.ricConnector.setEventListener((eventType, eventEnum, eventName, data) => {
        if (eventType === 'conn') {
          if (eventName === 'CONNECTING_RIC') {
            this.updateConnectionState_('connecting')
          } else if (eventName === 'CONNECTED_RIC') {
            this.updateConnectionState_('connected')
          } else if (eventName === 'DISCONNECTED_RIC') {
            this.updateConnectionState_('disconnected')
          } else if (eventName === 'CONNECTION_FAILED') {
            this.updateConnectionState_('disconnected')
          }
          // "CONN_STREAMING_ISSUE" maybe need
        }
      }
    )
  }


  destroy = async () => {
    this.ricConnector.setEventListener(null)
  }
}

```

#### Command 추가

마티에서 필요한 명령을 `CommandRunner.ts`에 추가하세요. 예를 들면 다음과 같이 할 수 있습니다.

```js
// file: main/src/hw/CommandRunner.ts

export class CommandRunner implements IHPetCommandRunner {

  // ... omit

  /**
   * command: getStateInfo
   * This function is a wrapper for ricConnector.sendRICRESTMsg().
   * The return value is automatically sent to the parent frame (CODINY)
   * @returns RICStateInfo
   */
  getStateInfo = async (): Promise<RICStateInfo> => {
    return this.ricConnector.getRICStateInfo()
  }

  /**
   * command: sendREST
   * This function is a wrapper for ricConnector.sendRICRESTMsg().
   * However, it includes an additional parameter called afterDelayMs.
   * @param cmd - RIC REST command
   * @param param - Parameters for the cmd
   * @param afterDelayMs - Time to wait after executing the command, no waiting if the value is 0
   * @returns The return value of ricConnector.sendRICRESTMsg()
   */
  sendREST = async (
    cmd: string,
    param?: object | null,
    afterDelayMs?: number
  ): Promise<any> => {
    const result = await this.ricConnector.sendRICRESTMsg(cmd, param || {})
    if (typeof afterDelayMs === 'number' && afterDelayMs > 0) {
      await sleepAsync(afterDelayMs)
    }

    return result
  }

  /**
   * command: sendFile
   * Sends a file
   * Transmits a file from the public/assets/files/ folder
   * e.g., soundtest_44100_48kbps.mp3, soundtest_44100_192kbps.mp3
   * @param fileName - The name of the file to be sent
   */
  sendFile = async (fileName: string): Promise<void> => {
    await helper.sendFile(this.ricConnector, fileName)
  }

  /**
   * command: streamSoundFile
   * Plays a sound
   * Plays a file from the public/assets/sounds/ folder
   * e.g., completed_tone_low_br.mp3
   * @param fileName - The name of the file to be played
   */
  streamSoundFile = async (fileName: string): Promise<void> => {
    await helper.streamSoundFile(this.ricConnector, fileName)
  }

  /**
   * command: startCheckCorrectRIC
   */
  startCheckCorrectRIC = async (): Promise<void> => {
    const availableColours = [
      { led: '#202000', lcd: '#FFFF00' },
      { led: '#880000', lcd: '#FF0000' },
      { led: '#000040', lcd: '#0080FF' },
    ]
    await this.ricConnector.checkCorrectRICStart(availableColours)
  }

  /**
   * command: acceptCheckCorrectRIC
   */
  acceptCheckCorrectRIC = async (): Promise<void> => {
    await this.ricConnector.checkCorrectRICStop(true)
  }

  /**
   * command: rejectCheckCorrectRIC
   */
  rejectCheckCorrectRIC = async (): Promise<void> => {
    await this.ricConnector.checkCorrectRICStop(false)
  }
}


```
