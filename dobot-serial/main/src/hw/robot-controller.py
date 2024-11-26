# robot_controller.py
import sys
import json
import asyncio
from time import sleep

class RobotController:
    def __init__(self):
        self.command_queue = asyncio.Queue()
        self.serial_data = None

    async def process_command(self, command):
        try:
            cmd_type = command.get('type')
            
            if cmd_type == 'serial':
                # 시리얼 데이터 저장
                self.serial_data = command.get('data')
                return {'status': 'success', 'type': 'serial_stored'}
            
            if cmd_type == 'move':
                # 시리얼 연결을 통해 로봇으로 명령 전송
                if self.serial_data:
                    # 실제로는 여기서 시리얼 데이터를 사용하여 로봇과 통신
                    params = command.get('params', {})
                    return {
                        'status': 'success',
                        'command': cmd_type,
                        'params': params
                    }
                else:
                    return {'status': 'error', 'message': 'No serial connection'}
            
            return {'status': 'error', 'message': 'Unknown command'}

        except Exception as e:
            return {'status': 'error', 'message': str(e)}

    async def run(self):
        while True:
            try:
                line = await self.get_input()
                if not line:
                    continue
                
                command = json.loads(line)
                result = await self.process_command(command)
                
                print(json.dumps(result))
                sys.stdout.flush()
                
            except Exception as e:
                print(json.dumps({'status': 'error', 'message': str(e)}))
                sys.stdout.flush()

    async def get_input(self):
        return await asyncio.get_event_loop().run_in_executor(None, sys.stdin.readline)

if __name__ == '__main__':
    controller = RobotController()
    asyncio.get_event_loop().run_until_complete(controller.run())
