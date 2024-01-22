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
- typescript@^5.2.2
- @mui/material@5

## Build and Run

```sh
pnpm install

# run dev mode
pnpm dev

# open url http://localhost:3000
```

## Some Command Examples

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

## Folder Structure

- `main/`
  - Contains the content of the iframe to be embedded in the Codiny service.
  - Includes the source code of the web page written in NextJS.
- `sub/eslint-config-custom/`
  - Contains eslint configurations.
- `sub/tsconfig/`
  - Contains TypeScript configurations.
- `blockcoding/`
  - Contains the javascriptGenerator code of the Block used in the AI Codiny block coding.
  - The code in this folder is for reference when registering blocks in the `AI Codiny block factory`. It is convenient to write the code here and copy-paste it into the `block factory`.

## Source Code Modification

- There is no need to modify the `sub/` folder.
- The parts to be modified in the source code of the `main/` folder are as follows:
  - `main/public/logo.png` - Register hardware image
  - `main/src/constants.ts` - Set hardware ID and name
  - `main/src/hw/CommandRunner.ts` - Add hardware control commands

That's all.

### Registering Hardware Image

To replace the logo file, save the file at the following path with the filename `logo.png`:

- `main/public/logo.png`
- The height of the logo file is fixed at `200px`. The width of the image is appropriate between `150~300px`.

### Setting Hardware ID and Name

Please modify the main/src/constants.ts file.

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

### Adding Hardware Control Commands

The `CommandRunner.ts` file contains content related to connection and control commands. Please modify this file to write additional commands.

Below is a summary of the minimum content that must be implemented:

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

#### Connection State Listener

- Event listeners such as connection state listeners are recommended to be registered in the `init()` function.
- Write the code to unregister event listeners in the `destroy()` function.

For example, you can do it as follows:

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

#### Adding a Command

Add the necessary commands to `CommandRunner.ts`. For example, you can do it as follows:

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
    const result = await this.ricConnector.sendRICRESTMsg(cmd, param ?? {})
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
}
```

End.
