## VeryBasicExample

# VeryBasic

![VeryBasic](./main/public/logo.png)

VeryBasic

## Technical stacks

- nodejs@20
- nextjs@14
- react@18
- worspace with turborepo
- pnpm
- typescript@^5.3.3
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
hw.foo() // response 'bar'
await hw.echo('hello') // response 'hello'
```

## Folder Structure

- `main/`
  - Contains the content of the iframe to be embedded in the Codiny service.
  - Includes the source code of the web page written in NextJS.
- `sub/eslint-config/`
  - Contains eslint configurations.
- `sub/typescript-config/`
  - Contains TypeScript configurations.
- `sub/ui/`
  - Contains ui components.
  
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
export const HW_ID = 'veryBasic'

/**
 * hardware name
 */
export const HW_NAME = {
  en: 'Very Basic',
  ko: '기본',
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
 * Additional commands are the remaining methods other than the ones mentioned above (e.g., echo).
 */
export class CommandRunner implements IHPetCommandRunner {
  /**
   * Lifecycle function, Automatically called.
   * An essential function that must be implemented.
   * Called once before communicating with parent frame (CODINY).
   * Initialization tasks, such as registering event listeners, can be performed here.
   */
  init = async (): Promise<void> => {
    log.debug('CommandRunner.init()')
  }

  /**
   * Lifecycle function, Automatically called.
   * An essential function that must be implemented.
   * Called once after the connection with the hardware is terminated.
   * Cleanup tasks, such as unregistering event listeners, can be performed here.
   */
  destroy = async () => {
    log.debug('CommandRunner.destroy()')
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
   *
   * Function to connect to the hardware.
   * Check the connection status in ricConnector.setEventListener().
   * An essential function that must be implemented.
   * @returns The return value is meaningless.
   */
  connect = async (): Promise<boolean> => {
    await fakeConnect()

    // When changing the connection state, be sure to call updateConnectionState_()
    this.updateConnectionState_('connected')
    return true
  }

  /**
   * command: disconnect
   *
   * Function to disconnect from the hardware.
   * An essential function that must be implemented.
   * @returns The return value is meaningless.
   */
  disconnect = async () => {
    await fakeDisconnect().catch((err) => {
      // ignore error
    })

    // When changing the connection state, be sure to call updateConnectionState_()
    this.updateConnectionState_('disconnected')
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
    // add event listener
  }


  destroy = async () => {
    // remove event listener
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
   * command: foo
   *
   * The return value is automatically sent to the parent frame (CODINY)
   * @returns 'bar'
   */
  foo = async (): Promise<string> => {
    return 'bar'
  }

  /**
   * command: echo
   *
   * The return value is automatically sent to the parent frame (CODINY)
   * @param what - string to echo
   * @returns echo string
   */
  echo = async (what: string): Promise<string> => {
    return what
  }
}
```

## Testing in IFRAME Playground

- You can test in the IFRAME playground of the Codiny Block Workshop.
- Prepare functioning hardware.
- Visit the following address and enter the IFRAME URL as http://localhost:3000 to test:
  - https://aicodiny.com/simul/hw-playground
- You can test in the IFRAME Playground even if you haven't registered blocks in Codiny's Block Workshop.

### Demo Videos

Please refer to the IFRAME Playground demo videos.

- The video shows hardware named `Marty` being operated in conjunction with Codiny.
- You can observe the process of the Codiny operational server connecting with the developer's local host.

- Marty Playground Demo
  - https://www.youtube.com/watch?v=89DEb8h49EA
- Marty Execution Demo
  - https://www.youtube.com/watch?v=ZYi-DQNnnLQ

End.
