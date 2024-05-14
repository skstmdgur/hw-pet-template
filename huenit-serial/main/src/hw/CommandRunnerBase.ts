import { logger } from '@/logger'
import { genId } from '@/util/gen-id'
import { chr, errmsg } from '@/util/misc'
import type {
  ConnectionState,
  HPetNotifiyEventDefinition,
  IHPetCommandRunner,
  IHPetContext,
  IParentSender,
} from '@ktaicoder/hw-pet'
import { HPetNotifyEventKeys } from '@ktaicoder/hw-pet'
import { sleepAsync } from '@repo/ui'
import type { EventEmitter } from 'eventemitter3'
import {
  BehaviorSubject,
  EMPTY,
  Subject,
  Subscription,
  concatMap,
  distinctUntilChanged,
  filter,
  firstValueFrom,
  from,
  map,
  switchMap,
  take,
  takeUntil,
  tap,
  type Observable,
} from 'rxjs'
import { HuenitParser } from './HuenitParser'
import { WebSerialDevice } from './WebSerialDevice'
import { openSerialDevice } from './command-util'
import type { BufferTimestamped } from './types'

type WriteDataType = number[] | Uint8Array | string
type WriteRequest = {
  requestId: string
  debugCmd: string
  data: WriteDataType
}

/**
 * Class for sending commands to the hardware.
 * Add the necessary commands here.
 * Write the method names the same as the commands.
 *
 * Lifecycle methods: init(), destroy()
 * Mandatory implementation methods: getConnectionState(), getHwId(), connect(), disconnect()
 * Additional commands are the remaining methods other than the ones mentioned above (e.g., echo).
 */
export class CommandRunnerBase implements IHPetCommandRunner {
  private stopped$ = new BehaviorSubject(false)

  /**
   * 연결 상태
   */
  private connectionState: ConnectionState = 'disconnected'

  /**
   * 하드웨어 ID
   */
  private hwId: string

  /**
   * 부모 프레임에 데이터 전송하는 도우미 객체
   */
  private toParent: IParentSender

  /**
   * 연결 상태 등을 부모 프레임에 notify하기 위한 이벤트 객체
   */
  private notifyEvents: EventEmitter<HPetNotifiyEventDefinition>

  /**
   * 시리얼 디바이스
   */
  private device_?: WebSerialDevice

  /**
   * 연결이 해제될 때 호출될 함수
   */
  private disposeFn_?: VoidFunction

  /**
   * rxLoop 리소스 해제 함수
   */
  private rxLoopDisposeFn_?: VoidFunction

  /**
   * 하드웨어로부터 수신된 데이터
   * 수신된 raw data를 HuenitParser로 파싱한 데이터
   */
  private rxPacket$ = new Subject<BufferTimestamped>()

  /**
   * 디바이스 쓰기 큐의 리소스 해제 함수
   */
  private writeRequestQueueDisposeFn_?: VoidFunction

  /**
   * 디바이스 쓰기 큐
   */
  private writeRequest$ = new Subject<WriteRequest>()

  /**
   * 디바이스의 응답 큐
   */
  private writeResponse$ = new Subject<{
    requestId: string
    returnData: Uint8Array | null
  }>()

  constructor(options: IHPetContext) {
    const { hwId, toParent, notifyEvents, commandEvents, uiEvents } = options

    this.hwId = hwId
    this.toParent = toParent
    this.notifyEvents = notifyEvents
    // commandEvents: 부모 프레임에서 전달되는 명령의 이벤트들
    // notifyEvents: 부모 프레임에 전달하는 연결 상태등의 notification 이벤트들
    // uiEvents: iframe의 ui와 상호작용할 수 있는 이벤트, 필요한 경우에만 사용
  }

  /**
   * Lifecycle function, Automatically called.
   * An essential function that must be implemented.
   * Called once before communicating with parent frame (CODINY).
   * Initialization tasks, such as registering event listeners, can be performed here.
   */
  init = async (): Promise<void> => {
    logger.debug('CommandRunner.init()')
  }

  /**
   * Lifecycle function, Automatically called.
   * An essential function that must be implemented.
   * Called once after the connection with the hardware is terminated.
   * Cleanup tasks, such as unregistering event listeners, can be performed here.
   */
  destroy = async () => {
    logger.debug('CommandRunner.destroy()')
  }

  /**
   * Update the connection state variable,
   * emit an event if the connection state has changed,
   * and notify the parent frame (CODINY).
   * @param state - The connection state
   */
  private updateConnectionState_ = (state: ConnectionState) => {
    if (state !== this.connectionState) {
      this.connectionState = state
      this.notifyEvents.emit(HPetNotifyEventKeys.connectionStateChanged, this.connectionState)

      // notify to parent frame (CODINY)
      this.toParent.notifyConnectionState(this.connectionState)
    }
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
    return this.connectionState
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
    return this.hwId
  }

  get stopped() {
    return this.stopped$.value
  }

  protected registerListeners_ = (device: WebSerialDevice) => {
    const subscription = new Subscription()

    // 디바이스의 상태가 변경될때 콜백 호출
    subscription.add(
      device.observeDeviceState().subscribe((state) => {
        if (state === 'opened') {
          this.onConnected_(device)
        } else if (state === 'closed') {
          this.onDisconnected_()
        }
      }),
    )

    this.disposeFn_ = () => {
      subscription.unsubscribe()
    }
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
    let port: SerialPort | undefined

    try {
      port = await openSerialDevice()
      if (!port) return false
    } catch (ignore) {
      logger.debug(errmsg(ignore))
    }

    if (!port) {
      return false
    }

    this.updateConnectionState_('connecting')
    const device = new WebSerialDevice()
    this.device_ = device
    this.registerListeners_(device)
    device.open(port, { baudRate: 115200 })

    // 연결이 되면 onConnected_() 가 호출되고,
    // 연결이 실패하면 onDisconnected_() 가 호출됩니다
    return true
  }

  /**
   * 디바이스 콜백 - 연결됨
   */
  protected onConnected_ = async (device: WebSerialDevice) => {
    this.stopped$.next(false)
    this.device_ = device
    this.updateConnectionState_('connected')

    // 하드웨어로부터 수신된 데이터를 처리한다
    this.rxLoop_()

    // 하드웨어 쓰기 요청이 도착하면
    // 하나씩 순차적으로 처리한다(concatMap)
    const subscription = new Subscription()
    subscription.add(
      this.writeRequest$
        .pipe(
          concatMap((request) => from(this.handleWriteRequest_(request))),
          takeUntil(this.closeTrigger_()),
        )
        .subscribe(),
    )
    this.writeRequestQueueDisposeFn_ = () => {
      subscription.unsubscribe()
    }
  }

  /**
   * 디바이스 콜백 - 연결이 끊어짐
   */
  protected onDisconnected_ = async () => {
    this.disconnect()
  }

  /**
   * Observable's destroy trigger
   */
  private closeTrigger_ = (): Observable<any> => {
    return this.stopped$.pipe(filter(Boolean), take(1))
  }

  /**
   * 디바이스에 데이터를 전송합니다
   * Send values to the device
   */
  protected writeRaw_ = async (values: number[] | Uint8Array | string): Promise<void> => {
    const device = this.device_
    // 디바이스에 연결되지 않은 상태
    if (!device) {
      logger.debug('writeRaw_(): ignore, device not connected')
      return
    }

    // 디바이스 중지 중
    if (this.stopped$.value) {
      logger.debug('writeRaw_(): ignore, stopping...')
      return
    }

    if (typeof values === 'string') {
      await device.write(new Uint8Array(values.split('').map(chr)))
    } else if (Array.isArray(values)) {
      await device.write(new Uint8Array(values))
    } else {
      await device.write(values)
    }
  }

  /**
   * 하드웨어 쓰기 요청을 처리합니다.
   * 하드웨어에 데이터를 전송한 후, 하드웨어로부터 응답을 기다립니다.
   */
  private handleWriteRequest_ = async (request: WriteRequest): Promise<Uint8Array | null> => {
    const { debugCmd, data, requestId } = request
    const startTime = Date.now()
    const values = typeof data === 'string' ? new Uint8Array(data.split('').map(chr)) : data
    logger.debug(`${debugCmd}: write start: ${num2str(values)}`)
    await this.writeRaw_(values)
    if (this.stopped$.value) {
      logger.debug(`${debugCmd} write canceled`)
      return null
    }
    const returnData = await this.readNext_()
    if (this.stopped$.value) {
      logger.debug(`${debugCmd} write canceled`)
      return null
    }
    const diff = Date.now() - startTime
    logger.debug(`${debugCmd}: \t\texecution time: ${diff}ms, response: ${num2str(returnData)}`)
    this.writeResponse$.next({
      requestId,
      returnData,
    })
    return returnData
  }

  /**
   * 하드웨어에 쓰기 요청을 enque 합니다.
   * @param debugCmd - 디버그용 명령어
   * @param values - 하드웨어에 전송할 데이터
   * @param afterDelayMillis - 명령을 실행한 후에 sleep 할 시간
   */
  protected write_ = async (
    debugCmd: string,
    values: number[] | Uint8Array | string,
    afterDelayMillis = 0,
  ): Promise<Uint8Array | null> => {
    if (this.stopped) return null
    const requestId = genId()

    // 요청을 enque하고
    this.writeRequest$.next({
      requestId,
      data: values,
      debugCmd,
    })

    // 응답을 기다리기
    try {
      const result = firstValueFrom(
        this.writeResponse$.pipe(
          filter((it) => it.requestId === requestId),
          map((it) => it.returnData),
          takeUntil(this.closeTrigger_()),
        ),
      )
      if (!result) return null
      if (!this.stopped && afterDelayMillis > 0) {
        logger.debug(`${debugCmd}: \t\tsleep ${afterDelayMillis}ms`)
        await sleepAsync(afterDelayMillis)
      }
      return result
    } catch (err) {
      // maybe canceled
      logger.debug('write fail:', errmsg(err))
    }
    return null
  }

  /**
   * 하드웨어로부터 도착한 데이터를 처리합니다.
   * 개행문자를 구분자로 파싱하여 패킷(Uint8Array)을 만듭니다.
   */
  private rxLoop_ = () => {
    const device = this.device_
    if (!device) {
      logger.debug('rxLoop_(): device is not opened')
      return
    }

    const subscription = new Subscription()
    subscription.add(
      device
        .observeOpenedOrNot()
        .pipe(
          distinctUntilChanged(),
          switchMap((opened) => (opened ? device.observeRawData() : EMPTY)),
          map((timestamped) => timestamped.dataBuffer),
          HuenitParser.parse(),
          tap((dataBuffer) => {
            this.rxPacket$.next({ timestamp: Date.now(), dataBuffer })
          }),
          takeUntil(this.closeTrigger_()),
        )
        .subscribe(),
    )

    this.rxLoopDisposeFn_ = () => {
      subscription.unsubscribe()
    }
  }

  /**
   * 하드웨어로부터 수신된 데이터를 가져옵니다.
   * 현재 시점 이후에 수신된 첫번째 데이터만 가져옵니다.
   */
  private readNext_ = async (): Promise<Uint8Array | null> => {
    if (this.stopped) return null
    const now = Date.now()
    try {
      return await firstValueFrom(
        this.rxPacket$.pipe(
          filter((it) => it.timestamp >= now),
          take(1),
          map((it) => it.dataBuffer),
        ),
      )
    } catch (err) {
      logger.debug('read failed', err)
    }
    return null
  }

  /**
   * command: disconnect
   *
   * Function to disconnect from the hardware.
   * An essential function that must be implemented.
   * @returns The return value is meaningless.
   */
  disconnect = async () => {
    this.stopped$.next(true)
    if (this.disposeFn_) {
      this.disposeFn_()
      this.disposeFn_ = undefined
    }

    if (this.rxLoopDisposeFn_) {
      this.rxLoopDisposeFn_()
      this.rxLoopDisposeFn_ = undefined
    }

    if (this.writeRequestQueueDisposeFn_) {
      this.writeRequestQueueDisposeFn_()
      this.writeRequestQueueDisposeFn_ = undefined
    }

    if (this.device_) {
      await this.device_.close()
      this.device_ = undefined
    }

    // When changing the connection state, be sure to call updateConnectionState_()
    this.updateConnectionState_('disconnected')
  }
}

function num2str(data: number[] | Uint8Array | null) {
  if (!data) {
    return '<null>'
  }
  const msg1 = data.join(' ')
  let msg2: string[] = []
  for (let i = 0; i < data.length; i++) {
    const c = data[i]
    if (c === 10) {
      msg2.push('\\n')
    } else if (c === 13) {
      msg2.push('\\r')
    } else {
      msg2.push(String.fromCharCode(c))
    }
  }
  return `[${msg1}] '${msg2.join('')}'`
}
