## TODO

### 개발하는 동안 테스트

## huenit 제어 커맨드 예시

serial connection 완료 이후

await hw.robothome();
await hw.moveG0(0, 180, 0);
await hw.suctionOn();
await hw.suctionOff();
...
