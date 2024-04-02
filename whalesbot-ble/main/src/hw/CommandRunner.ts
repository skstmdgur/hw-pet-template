import { clamp } from '@/util/misc';
import { filter, firstValueFrom, map, take, merge, timer } from 'rxjs';
import { CommandRunnerBase } from './CommandRunnerBase';
import { LINE_MASKS, NOTE_OCT, NOTE_SCALE, STEERING } from './altino-lite-utils';
import { packet, Respones, STATUS_DONE } from './Packet';
import logger from '../log';

const log = logger('whalesbot-ble');
log.enable(false);

enum Key {
  BTKEY = 0,
  BTSTICK1 = 1,
  BTSTICK2 = 2,
  BTSTICK3 = 3,
  BTSTICK4 = 4,
}

enum Direction {
  UP = 1,
  DOWN = 2,
  FRONT = 3,
  BACK = 4,
  LEFT = 5,
  RIGHT = 6,
  TURN_LEFT = 7,
  TURN_RIGHT = 8,
}

enum State {
  STATE_PITCH = 1, //姿态角Pitch，单位°
  STATE_ROLL = 2, //姿态角Roll，单位°
  STATE_YAW = 3, //姿态角Yaw，单位°
  POS_X = 4, //飞行器位置，纵向X，单位cm
  POS_Y = 5, //飞行器位置，横向Y，单位cm
  POS_Z = 6, //飞行器高度，Z，单位cm
  VEL_X = 7, //飞行器纵向X速度，单位cm/s
  VEL_Y = 8, //飞行器横向Y速度，单位cm/s
  VEL_Z = 9, //飞行器高度Z速度，单位cm/s
  STATE_TEMP = 10, //飞行器内部主板温度
  OPFLOWOK = 11, //光流数据可用性
  LASERQUALITY = 12, //激光数据可用性
  ACC_X = 13, //加速度X方向，单位 g(9.8m/s^2)
  ACC_Y = 14, //加速度Y方向，单位 g(9.8m/s^2)
  ACC_Z = 15, //加速度Z方向，单位 g(9.8m/s^2)
  GYPO_X = 16, //陀螺X方向，单位 °/s
  GYPO_Y = 17, //陀螺Y方向，单位 °/s
  GYPO_Z = 18, //陀螺Z方向，单位 °/s
  SETSPEED = 19, //返回设置速度
  LASER = 20, //返回激光测距数据，单位cm
  ASL = 21, //返回气压测量高度，单位cm
  OPX = 22, //返回光流X累计位移，单位cm
  OPY = 23, //返回光流Y累计位移，单位cm
  TEMP = 24, //返回主板温度
  //DUMMY
  APTX = 33, //返回二维码地图坐标（需要二维码地图和K210支持）
  APTY = 34, //返回二维码地图坐标
  LASER_NOW = 46, //返回激光瞬态数据
}

class Result {
  error: number;
  errorMessage?: string;
  resp?: Respones;

  constructor() {
    this.error = 0;
  }

  static fromError(errorId: number, message: string): Result {
    return { error: errorId, errorMessage: message };
  }

  static fromResponse(resp: Respones): Result {
    return { error: 0, resp: resp };
  }
}

//function clamp(value: number, min: number)

/**
 * Inherits from the CommandRunnerBase class.
 * CommandRunnerBase handles the aspects related to the connection with hardware,
 * and this class handles the remaining commands that are sent to the hardware.
 */
export class CommandRunner extends CommandRunnerBase {
  async log_enable(enable: boolean): Promise<void> {
    log.enable(enable);
  }

  /**
   * 进入起桨模式
   */
  async action_enter_tol_mode_eg1101(): Promise<void> {
    const buffer = packet.packCmd(0x10, []);
    const ret = await this.request(buffer);
  }
  /**
   * 退出起桨模式
   */
  async action_exit_tol_mode_eg1101(): Promise<void> {
    const buffer = packet.packCmd(0x12, []);
    const ret = await this.request(buffer);
  }

  /**
   * 自动起飞
   */
  async action_takeoff_eg1101(height: number): Promise<void> {
    height = clamp(height, 50, 100);
    const buffer = packet.packCmd(0x14, [height]);
    const ret = await this.request(buffer);
  }

  /**
   * 自动起飞 偏移
   */
  async action_takeoff_ext_eg1101(
    height: number,
    speed: number,
    xoffset: number,
    yoffset: number,
  ): Promise<void> {
    height = clamp(height, 50, 100);
    speed = clamp(speed, 10, 100);
    xoffset = clamp(xoffset, -10, 10);
    yoffset = clamp(yoffset, -10, 10);
    const buffer = packet.packCmd(0x16, [height, speed, xoffset, yoffset]);
    const ret = await this.request(buffer);
  }

  /**
   * 自动降落
   */
  async action_landing_eg1101(): Promise<void> {
    const buffer = packet.packCmd(0x18, []);
    const ret = await this.request(buffer);
  }

  /**
   * 自动降落 偏移
   */
  async action_landing_ext_eg1101(speed: number, xoffset: number, yoffset: number): Promise<void> {
    speed = clamp(speed, 10, 100);
    xoffset = clamp(xoffset, -10, 10);
    yoffset = clamp(yoffset, -10, 10);
    const buffer = packet.packCmd(0x1a, [speed, xoffset, yoffset]);
    const ret = await this.request(buffer);
  }

  /**
   * 设置飞机速度
   */
  async action_set_fly_speed_eg1101(speed: number): Promise<void> {
    speed = clamp(speed, 10, 100);
    const buffer = packet.packCmd(0x1a, [speed]);
    const ret = await this.request(buffer);
  }

  async action_set_sound(soundId: number): Promise<void> {
    log.log(`CommandRunner::action_set_fly_speed_eg1101(${soundId})`);
    const buffer = packet.allocCmdFromId(16);
    buffer.writeInt8(soundId, 3);
    buffer.writeUInt8(packet.nextRequestId(), 18);

    const sum = packet.checksum(buffer, 2, 18);
    buffer.writeUInt8(sum, 19);

    log.log(`CommandRunner::action_set_fly_speed_eg1101 buffer:(${buffer.toString('hex')})`);

    await this.writeRaw_(buffer).catch((err) => {
      log.info(`action_set_fly_speed_eg1101 writeRaw_ fail: ${err.message}`);
    });
  }

  /**
   * 获取设置速度
   */
  async action_get_fly_speed_eg1101(): Promise<number> {
    const buffer = packet.packCmd(0x1a, []);
    const ret = await this.request(buffer);
    return Promise.resolve(ret.length > 0 ? ret[0] : 0);
  }

  private async move_to(direction: Direction, speed: number): Promise<void> {
    const buffer = packet.packCmd(0x20, [direction, speed]);
    const ret = await this.request(buffer);
  }

  /**
   * 向上移动
   */
  async action_fly_up_eg1101(speed: number): Promise<void> {
    speed = clamp(speed, 5, 500);
    await this.move_to(Direction.UP, speed);
  }
  /**
   * 向下移动
   */
  async action_fly_down_eg1101(speed: number): Promise<void> {
    speed = clamp(speed, 5, 500);
    await this.move_to(Direction.DOWN, speed);
  }
  /**
   * 向前移动
   */
  async action_fly_front_eg1101(speed: number): Promise<void> {
    speed = clamp(speed, 5, 500);
    await this.move_to(Direction.FRONT, speed);
  }

  /**
   * 向后移动
   */
  async action_fly_back_eg1101(speed: number): Promise<void> {
    speed = clamp(speed, 5, 500);
    await this.move_to(Direction.BACK, speed);
  }
  /**
   * 向后移动
   */
  async action_fly_left_eg1101(speed: number): Promise<void> {
    speed = clamp(speed, 5, 500);
    await this.move_to(Direction.LEFT, speed);
  }
  /**
   * 向后移动
   */
  async action_fly_right_eg1101(speed: number): Promise<void> {
    speed = clamp(speed, 5, 500);
    await this.move_to(Direction.RIGHT, speed);
  }
  /**
   * 向左旋转
   */
  async action_fly_turnleft_eg1101(angle: number): Promise<void> {
    angle = clamp(angle, 1, 360);
    await this.move_to(Direction.TURN_LEFT, angle);
  }
  /**
   * 向右旋转
   */
  async action_fly_turnright_eg1101(angle: number): Promise<void> {
    angle = clamp(angle, 1, 360);
    await this.move_to(Direction.TURN_RIGHT, angle);
  }
  /**
   * 向指定方向飞行
   */
  async action_fly_direction_eg1101(speed: number, angle: number): Promise<void> {
    speed = clamp(speed, -100, 100);
    angle = clamp(angle, 0, 360);
    const buffer = packet.packCmd(0x30, [speed, angle]);
    const ret = await this.request(buffer);
  }
  /**
   * 飞行指定距离
   */
  async action_fly_moveto_eg1101(x: number, y: number, z: number, speed: number): Promise<void> {
    x = clamp(x, -500, 500);
    y = clamp(y, -500, 500);
    z = clamp(z, -500, 500);
    speed = clamp(speed, 0, 100);
    const buffer = packet.packCmd(0x32, [x, y, z, speed]);
    const ret = await this.request(buffer);
  }

  /**
   * 设置摇控制四个通道杆量
   */
  async action_fly_pyrp_eg1101(
    pitch: number,
    roll: number,
    throttle: number,
    yaw: number,
  ): Promise<void> {
    pitch = clamp(pitch, -100, 100);
    roll = clamp(roll, -100, 100);
    throttle = clamp(throttle, -100, 100);
    yaw = clamp(yaw, -100, 100);
    const buffer = packet.packCmd(0x34, [pitch, roll, throttle, yaw]);
    const ret = await this.request(buffer);
  }
  /**
   * 停止运动并悬停
   */
  async action_hover_eg1101(): Promise<void> {
    const buffer = packet.packCmd(0x36, []);
    const ret = await this.request(buffer);
  }
  /**
   * 紧急停桨
   */
  async action_estop_eg1101(): Promise<void> {
    const buffer = packet.packCmd(0x12, []);
    const ret = await this.request(buffer);
  }

  /**
   * 设置舵机
   */
  async action_set_serve_eg1101(port: number, speed: number, angle: number): Promise<void> {
    port = 2;
    speed = clamp(speed, 0, 100);
    angle = clamp(angle, 0, 180);
    const buffer = packet.packCmd(0x3a, [port, speed, angle]);
    const ret = await this.request(buffer);
  }
  /**
   * 调试
   */
  async action_debugger_eg1101(label: number, value: number): Promise<void> {
    label = clamp(label, -999999, 999999);
    value = clamp(value, -999999, 999999);
    const buffer = packet.packCmd(0x3c, [label, value]);
    const ret = await this.request(buffer);
  }
  /**
   * 情感屏 设置符号
   */
  async action_set_symbol_eg1101(symbol: number, port: number): Promise<void> {
    symbol = clamp(symbol, 1, 53);
    port = clamp(port, 1, 2);
    const buffer = packet.packCmd(0x3e, [port, symbol]);
    const ret = await this.request(buffer);
  }
  /**
   * 情感屏 设置符号
   */
  async action_off_led_matrix_eg1101(port: number): Promise<void> {
    port = clamp(port, 1, 2);
    const buffer = packet.packCmd(0x40, [port]);
    const ret = await this.request(buffer);
  }
  /**
   * 数码管
   */
  async action_digitron_eg1101(port: number, value: number): Promise<void> {
    port = clamp(port, 1, 2);
    value = clamp(value, 0, 9999);
    const buffer = packet.packCmd(0x42, [port, value]);
    const ret = await this.request(buffer);
  }
  /**
   * 数码管比分显示
   */
  async action_digitron_score_eg1101(port: number, value: number, value2: number): Promise<void> {
    port = clamp(port, 1, 2);
    value = clamp(value, 0, 99);
    value2 = clamp(value2, 0, 99);
    const buffer = packet.packCmd(0x44, [port, value, value2]);
    const ret = await this.request(buffer);
  }
  /**
   * 清空数码管
   */
  async action_digitron_clear_eg1101(port: number): Promise<void> {
    port = clamp(port, 1, 2);
    const buffer = packet.packCmd(0x46, [port]);
    const ret = await this.request(buffer);
  }
  /**
   * 设置LED灯
   */
  async action_light_RGB_eg1101(port: number, r: number, g: number, b: number): Promise<void> {
    port = clamp(port, 1, 2);
    r = clamp(r, 0, 255);
    g = clamp(g, 0, 255);
    b = clamp(b, 0, 255);
    const buffer = packet.packCmd(0x48, [port, r, g, b]);
    const ret = await this.request(buffer);
  }
  /**
   * 机载灯光
   */
  async action_airborne_light_eg1101(color: number): Promise<void> {
    color = clamp(color, 1, 8);
    const buffer = packet.packCmd(0x4a, [color]);
    const ret = await this.request(buffer);
  }
  /**
   * 设置电磁铁
   */
  async action_electronmgnet_eg1101(port: number, value: number): Promise<void> {
    port = clamp(port, 1, 2);
    value = value === 1 ? 1 : 0;
    const buffer = packet.packCmd(0x4c, [port, value]);
    const ret = await this.request(buffer);
  }

  private async fly_state(type: number): Promise<number> {
    const buffer = packet.packCmd(0x4e, [type]);
    const ret = await this.request(buffer);
    return Promise.resolve(ret.length > 0 ? ret[0] : 0);
  }

  /**
   * 飞行高度
   */
  async sensor_flying_height_eg1101(): Promise<number> {
    const ret = await this.fly_state(State.POS_Z);
    log.log(`sensor_flying_height_eg1101 ${ret} `);
    return ret;

    //await this.timeout_test();

    //return 0;
  }

  async timeout_test(): Promise<void> {
    const ret = 0; // await this.fly_state(State.POS_Z)
    let start = Date.now();

    await firstValueFrom(
      merge(
        timer(10).pipe(map((it) => log.log(`timer(10) ${it}`))),
        timer(15).pipe(map((it) => log.log(`timer(15) ${it}`))),
      ),
    );

    log.log(`sensor_flying_height_eg1101 sleep ${Date.now() - start}`);
  }
  /**
   * 机身内部激光测距
   */
  async sensor_laser_inner_eg1101(): Promise<number> {
    const ret = await this.fly_state(State.LASER);
    return ret;
  }
  /**
   * 电池电压
   */
  async sensor_battery_voltage_eg1101(): Promise<number> {
    const buffer = packet.packCmd(0x50, []);
    const ret = await this.request(buffer);
    return Promise.resolve(ret.length > 0 ? ret[0] : 0);
  }
  /**
   * 电池电压
   */
  async sensor_motherboard_temp_eg1101(): Promise<number> {
    const ret = await this.fly_state(State.STATE_TEMP);
    return ret;
  }
  /**
   * 姿态角
   */

  attitudeType = [State.STATE_PITCH, State.STATE_ROLL, State.STATE_YAW];
  async sensor_attitude_angle_eg1101(type: number): Promise<number> {
    type = clamp(type, 1, this.attitudeType.length);
    let val = this.attitudeType[type - 1];
    const ret = await this.fly_state(val);
    return ret;
  }

  /**
   * 飞行角速度
   */

  GYPOType = [State.GYPO_X, State.GYPO_Y, State.GYPO_Z];
  async sensor_flying_speed_eg1101(type: number): Promise<number> {
    type = clamp(type, 1, this.GYPOType.length);
    let val = this.GYPOType[type - 1];
    const ret = await this.fly_state(val);
    return ret;
  }

  /**
   * 飞行加速度
   */

  ACCEType = [State.ACC_X, State.ACC_Y, State.ACC_Z];
  async sensor_flying_accelerate_eg1101(type: number): Promise<number> {
    type = clamp(type, 1, this.ACCEType.length);
    let val = this.ACCEType[type - 1];
    const ret = await this.fly_state(val);
    return ret;
  }

  /**
   * 飞行角速度
   */

  OPType = [State.OPX, State.OPY];
  async sensor_optical_flow_eg1101(type: number): Promise<number> {
    type = clamp(type, 1, this.OPType.length);
    let val = this.OPType[type - 1];
    const ret = await this.fly_state(val);
    return ret;
  }

  /**
   * 红外传感器距离
   */
  async sensor_infrared_eg1101(port: number): Promise<number> {
    port = clamp(port, 1, 2);
    const buffer = packet.packCmd(0x52, [port]);
    const ret = await this.request(buffer);
    return Promise.resolve(ret.length > 0 ? ret[0] : 0);
  }
  /**
   * 红外传感器检测障碍物
   */
  async sensor_infrared_detected_eg1101(port: number): Promise<number> {
    port = clamp(port, 1, 2);
    const buffer = packet.packCmd(0x54, [port]);
    const ret = await this.request(buffer);
    return Promise.resolve(ret.length > 0 ? ret[0] : 0);
  }
  /**
   * 人体红外传感器检测人
   */
  async sensor_infrared_human_eg1101(port: number): Promise<number> {
    port = clamp(port, 1, 2);
    const buffer = packet.packCmd(0x56, [port]);
    const ret = await this.request(buffer);
    return Promise.resolve(ret.length > 0 ? ret[0] : 0);
  }
  /**
   * 模拟输入
   */
  async sensor_analog_input_eg1101(port: number): Promise<number> {
    port = clamp(port, 1, 2);
    const buffer = packet.packCmd(0x58, [port]);
    const ret = await this.request(buffer);
    return Promise.resolve(ret.length > 0 ? ret[0] : 0);
  }
  /**
   * 超声探测距离
   */
  async sensor_ultrasonic_distance_eg1101(port: number): Promise<number> {
    port = clamp(port, 1, 2);
    const buffer = packet.packCmd(0x5a, [port]);
    const ret = await this.request(buffer);
    return Promise.resolve(ret.length > 0 ? ret[0] : 0);
  }
  /**
   * 环境光
   */
  async sensor_ambient_light_value_eg1101(port: number): Promise<number> {
    const buffer = packet.packCmd(0x5c, [port]);
    const ret = await this.request(buffer);
    return Promise.resolve(ret.length > 0 ? ret[0] : 0);
  }
  /**
   * 温度
   */
  async sensor_temperature_value_eg1101(port: number): Promise<number> {
    port = clamp(port, 1, 2);
    const buffer = packet.packCmd(0x5e, [port]);
    const ret = await this.request(buffer);
    return Promise.resolve(ret.length > 0 ? ret[0] : 0);
  }
  /**
   * 湿度
   */
  async sensor_humidity_value_eg1101(port: number): Promise<number> {
    const buffer = packet.packCmd(0x60, [port]);
    const ret = await this.request(buffer);
    return Promise.resolve(ret.length > 0 ? ret[0] : 0);
  }
  /**
   * 火焰
   */
  async sensor_flame_value_eg1101(port: number): Promise<number> {
    port = clamp(port, 1, 2);
    const buffer = packet.packCmd(0x62, [port]);
    const ret = await this.request(buffer);
    return Promise.resolve(ret.length > 0 ? ret[0] : 0);
  }
  /**
   * 手势
   */
  async sensor_gesture_eg1101(port: number): Promise<number> {
    port = clamp(port, 1, 2);
    const buffer = packet.packCmd(0x64, [port]);
    const ret = await this.request(buffer);
    return Promise.resolve(ret.length > 0 ? ret[0] : 0);
  }
  /**
   * 激光测距-外部
   */
  async sensor_laser_external_eg1101(port: number): Promise<number> {
    port = clamp(port, 1, 2);
    const buffer = packet.packCmd(0x66, [port]);
    const ret = await this.request(buffer);
    return Promise.resolve(ret.length > 0 ? ret[0] : 0);
  }
  /**
   * 激光定高
   */
  async sensor_laser_height_determination_eg1101(value: number): Promise<number> {
    value = value === 1 ? 1 : 0;
    const buffer = packet.packCmd(0x68, [value]);
    const ret = await this.request(buffer);
    return Promise.resolve(ret.length > 0 ? ret[0] : 0);
  }
  /**
   * 遥控器按键
   */
  BUTTONType = [Key.BTKEY, Key.BTSTICK2, Key.BTSTICK1, Key.BTSTICK4, Key.BTSTICK3];
  async sensor_remote_control_eg1101(value: number): Promise<number> {
    value = clamp(value, 1, this.BUTTONType.length);
    const key = this.BUTTONType[value - 1];
    const buffer = packet.packCmd(0x6a, [key]);
    const ret = await this.request(buffer);
    return Promise.resolve(ret.length > 0 ? ret[0] : 0);
  }

  async fly_RGB(color: number): Promise<void> {
    await this.set_RGB(color).catch((err) => {
      log.log('set_RGB error ', err);
    });
  }

  async set_RGB(color: number): Promise<void> {
    const buffer = packet.packCmd(0x4a, [color]);
    const ret = await this.request(buffer);
  }

  async ping(): Promise<void> {
    const buffer = packet.packCmd(0x06, []);
    const ret = await this.request(buffer);
  }

  async battery(): Promise<number> {
    const buffer = packet.packCmd(0x50, []);
    const ret = await this.request(buffer);
    log.log('battery', `${ret}`);
    return Promise.resolve(ret.length > 0 ? ret[0] : 0);
  }

  private async request(buf: Buffer): Promise<Array<number>> {
    const now = Date.now();
    const interval = 300; //ms

    log.log('request: now ', `${now}`);

    let errorCount = 0;
    let noRespCount = 0;
    let count = 0;
    let result = new Array<number>();

    log.log('request: send', `${buf.toString('hex')}`);

    while (errorCount < 5 && noRespCount < 5 && count <= 50) {
      count += 1;
      log.log('request', `errorCount:${errorCount}, noRespCount:${noRespCount},count:${count}`);

      const writetime = Date.now();

      await this.writeOutput_(buf);

      const received = await this.readNext_().catch((err) => {
        log.info(`readNext_ fail: ${err}`);
      });

      if (received == null) {
        noRespCount++;
        log.log('request no response ', `${noRespCount}`);
        continue;
      }

      log.log('request', `received:${received.toString('hex')}`);

      const resp = this.parseCmd(received);
      log.log('request', `resp:${JSON.stringify(resp)} `);
      if (resp.error != 0) {
        log.log('request', `resp:${resp} `);
        errorCount++;
      } else if (resp.resp != null && resp.resp.status == STATUS_DONE) {
        result = resp.resp.args;
        break;
      }
    }

    return Promise.resolve(result);
  }

  private parseCmd = function (buffer: Buffer): Result {
    if (buffer.length < 20) {
      log.log('parseCmd buffer length error ', `${buffer.length}`);
      return Result.fromError(1, 'buffer length error');
    }

    const sum = packet.checksum(buffer, 2, 18);
    if (sum != buffer.readUint8(19)) {
      log.log('parseCmd checksum error ', `${sum} ${buffer.readUint8(19)}`);
      return Result.fromError(1, 'checksum error');
    }

    const resp = Respones.fromBuffer(buffer);

    return Result.fromResponse(resp);
  };

  protected async readNext_(): Promise<Buffer | null> {
    /*
    return await this.read(10, 10).then((array) => {
      return Buffer.from(array);
    });
    */

    const now = Date.now();
    return firstValueFrom(
      merge(
        this.deviceData$.asObservable().pipe(
          filter((it) => it.timestamp > now),
          take(1),
          map((it) => {
            log.log('deviceData ==== ', `${Date.now() - now} `);
            return Buffer.from(it.dataBuffer);
          }),
        ),
        timer(100).pipe(
          map((it) => {
            log.log('readNext_ timer 100 ==== ', `${Date.now() - now} `);
            return null;
          }),
        ),
      ),
    );
  }
}
