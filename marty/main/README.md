# Marty iframe

First, run the development server:

```bash
yarn dev
```

## commands

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
hw.startCheckCorrectRIC()
hw.acceptCheckCorrectRIC()

// sounds
hw.streamSoundFile('completed_tone_low_br.mp3')
hw.streamSoundFile('test440ToneQuietShort.mp3')
hw.streamSoundFile('unplgivy.mp3')

// files
hw.sendFile('soundtest_44100_48kbps.mp3')
hw.sendFile('soundtest_44100_192kbps.mp3')
hw.sendFile('unplgivy.mp3')
```
