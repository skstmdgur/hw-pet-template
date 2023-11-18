import { CommandRunnerBase } from './CommandRunnerBase'

/**
 * Inherits from the CommandRunnerBase class.
 * CommandRunnerBase handles the aspects related to the connection with hardware,
 * and this class handles the remaining commands that are sent to the hardware.
 */
export class CommandRunner extends CommandRunnerBase {
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
