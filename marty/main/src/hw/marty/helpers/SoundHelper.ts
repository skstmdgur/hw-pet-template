import martyConnector from "../MartyConnector";
import fetchWithTimeout from "./fetchWithTimeout";
import { PitchShifter } from "soundtouchjs";
import lamejs from "../external_libs/lame-all";

export interface SoundData {
  name: string
  duration: number // ms
};
export interface VoiceData {
  name: string
  gender: string
  playbackRate: number
};

const ARABIC_ID = "ar";
const CHINESE_ID = "zh-cn";
const DANISH_ID = "da";
const DUTCH_ID = "nl";
const ENGLISH_ID = "en";
const FRENCH_ID = "fr";
const GERMAN_ID = "de";
const HINDI_ID = "hi";
const ICELANDIC_ID = "is";
const ITALIAN_ID = "it";
const JAPANESE_ID = "ja";
const KOREAN_ID = "ko";
const NORWEGIAN_ID = "nb";
const POLISH_ID = "pl";
const PORTUGUESE_BR_ID = "pt-br";
const PORTUGUESE_ID = "pt";
const ROMANIAN_ID = "ro";
const RUSSIAN_ID = "ru";
const SPANISH_ID = "es";
const SPANISH_419_ID = "es-419";
const SWEDISH_ID = "sv";
const TURKISH_ID = "tr";
const WELSH_ID = "cy";

const SERVER_TIMEOUT = 10000;
export default class SoundHelper {
  static SOUND_DATA: SoundData[] = [{
    name: 'arcade-beep.mp3',
    duration: 1000
  },
  {
    name: 'celebrate.mp3',
    duration: 8000
  },
  {
    name: 'confused.mp3',
    duration: 1000
  },
  {
    name: 'disbelief.mp3',
    duration: 2000
  },
  {
    name: 'excited.mp3',
    duration: 2000
  },
  {
    name: 'no_way.mp3',
    duration: 2000
  },
  {
    name: 'no.mp3',
    duration: 1000
  },
  {
    name: 'unplugged.mp3',
    duration: 2000
  },
  {
    name: 'whistle.mp3',
    duration: 2000
  }
  ];
  static VOICES_DATA: VoiceData[] = [{
    name: 'Tenor',
    gender: 'male',
    playbackRate: 1
  },
  {
    name: 'Alto',
    gender: 'Female',
    playbackRate: 1
  },
  {
    name: 'kitten',
    gender: 'female',
    playbackRate: 1.41
  }
  ];
  static LANGUAGE_DATA = {
    [ARABIC_ID]: {
      name: "Arabic",
      locales: ["ar"],
      speechSynthLocale: "arb",
      singleGender: true,
    },
    [CHINESE_ID]: {
      name: "Chinese (Mandarin)",
      locales: ["zh-cn", "zh-tw"],
      speechSynthLocale: "cmn-CN",
      singleGender: true,
    },
    [DANISH_ID]: {
      name: "Danish",
      locales: ["da"],
      speechSynthLocale: "da-DK",
    },
    [DUTCH_ID]: {
      name: "Dutch",
      locales: ["nl"],
      speechSynthLocale: "nl-NL",
    },
    [ENGLISH_ID]: {
      name: "English",
      locales: ["en"],
      speechSynthLocale: "en-US",
    },
    [FRENCH_ID]: {
      name: "French",
      locales: ["fr"],
      speechSynthLocale: "fr-FR",
    },
    [GERMAN_ID]: {
      name: "German",
      locales: ["de"],
      speechSynthLocale: "de-DE",
    },
    [HINDI_ID]: {
      name: "Hindi",
      locales: ["hi"],
      speechSynthLocale: "hi-IN",
      singleGender: true,
    },
    [ICELANDIC_ID]: {
      name: "Icelandic",
      locales: ["is"],
      speechSynthLocale: "is-IS",
    },
    [ITALIAN_ID]: {
      name: "Italian",
      locales: ["it"],
      speechSynthLocale: "it-IT",
    },
    [JAPANESE_ID]: {
      name: "Japanese",
      locales: ["ja", "ja-hira"],
      speechSynthLocale: "ja-JP",
    },
    [KOREAN_ID]: {
      name: "Korean",
      locales: ["ko"],
      speechSynthLocale: "ko-KR",
      singleGender: true,
    },
    [NORWEGIAN_ID]: {
      name: "Norwegian",
      locales: ["nb", "nn"],
      speechSynthLocale: "nb-NO",
      singleGender: true,
    },
    [POLISH_ID]: {
      name: "Polish",
      locales: ["pl"],
      speechSynthLocale: "pl-PL",
    },
    [PORTUGUESE_BR_ID]: {
      name: "Portuguese (Brazilian)",
      locales: ["pt-br"],
      speechSynthLocale: "pt-BR",
    },
    [PORTUGUESE_ID]: {
      name: "Portuguese (European)",
      locales: ["pt"],
      speechSynthLocale: "pt-PT",
    },
    [ROMANIAN_ID]: {
      name: "Romanian",
      locales: ["ro"],
      speechSynthLocale: "ro-RO",
      singleGender: true,
    },
    [RUSSIAN_ID]: {
      name: "Russian",
      locales: ["ru"],
      speechSynthLocale: "ru-RU",
    },
    [SPANISH_ID]: {
      name: "Spanish (European)",
      locales: ["es"],
      speechSynthLocale: "es-ES",
    },
    [SPANISH_419_ID]: {
      name: "Spanish (Latin American)",
      locales: ["es-419"],
      speechSynthLocale: "es-US",
    },
    [SWEDISH_ID]: {
      name: "Swedish",
      locales: ["sv"],
      speechSynthLocale: "sv-SE",
      singleGender: true,
    },
    [TURKISH_ID]: {
      name: "Turkish",
      locales: ["tr"],
      speechSynthLocale: "tr-TR",
      singleGender: true,
    },
    [WELSH_ID]: {
      name: "Welsh",
      locales: ["cy"],
      speechSynthLocale: "cy-GB",
      singleGender: true,
    },
  };

  static SOUNDS_DIR = 'assets/sounds';

  static getSoundDuration(soundName: string): number | undefined {
    const soundData = SoundHelper.getSoundData(soundName);
    if (!soundData) {
      throw new Error(`Sound not found: ${soundName}`);
    }
    return soundData.duration;
  }

  static getSoundData(soundName: string): SoundData | undefined {
    return SoundHelper.SOUND_DATA.find((soundData) => soundData.name === soundName);
  }

  static async fetchSound(soundName: string): Promise<Uint8Array> {
    const soundData = SoundHelper.getSoundData(soundName);
    if (!soundData) {
      throw new Error(`Sound not found: ${soundName}`);
    }
    const response = await fetch(`${this.SOUNDS_DIR}/${soundData.name}`);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = new Uint8Array(arrayBuffer);
    return audioBuffer;
  }

  static getVoiceData(voiceName: string): VoiceData | undefined {
    return SoundHelper.VOICES_DATA.find((voiceData) => voiceData.name === voiceName);
  }

  static getText2SpeechUrl(words: string, gender: string, locale: string): string {
    const SERVER_HOST = "https://synthesis-service.scratch.mit.edu";
    let path = `${SERVER_HOST}/synth`;
    path += `?locale=${locale}`;
    path += `&gender=${gender}`;
    path += `&text=${encodeURIComponent(words.substring(0, 128))}`;
    return path;
  }

  static async speak(words: string, gender: string, locale: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const path = this.getText2SpeechUrl(words, gender, locale);
      const playbackRate = 1;
      const pitch = 1;
      // Perform HTTP request to get audio file
      return fetchWithTimeout(path, {}, SERVER_TIMEOUT)
        .then((res) => {
          if (res.status !== 200) {
            throw new Error(
              `HTTP ${res.status} error reaching translation service`
            );
          }

          return res.arrayBuffer();
        })
        .then((buffer) => {
          // Play the sound

          const audioContext = new AudioContext();
          return audioContext.decodeAudioData(buffer);
        })
        .then((decodedBuffer) => {
          const audioContext = new AudioContext();

          // Extend the buffer by 1 seconds to avoid truncation
          const sampleRate = decodedBuffer.sampleRate;
          const additionalTime = 1; // seconds
          const additionalSamples = additionalTime * sampleRate;

          // Create a new buffer with space for the original audio + extra seconds
          const extendedBuffer = audioContext.createBuffer(
            decodedBuffer.numberOfChannels,
            decodedBuffer.length + additionalSamples,
            sampleRate
          );

          // Copy the original audio data to the new buffer
          for (
            let channel = 0;
            channel < decodedBuffer.numberOfChannels;
            channel++
          ) {
            const oldData = decodedBuffer.getChannelData(channel);
            const newData = extendedBuffer.getChannelData(channel);

            // Copy data from old buffer to new buffer
            for (let i = 0; i < oldData.length; i++) {
              newData[i] = oldData[i];
            }

            // The rest of the new buffer will remain silent (values are 0 by default)
          }

          const processedDuration = extendedBuffer.duration / playbackRate; // Adjusted duration based on tempo change
          const maxDuration = Math.max(
            extendedBuffer.duration,
            processedDuration
          ); // Maximum of original and processed durations
          const sampleLength = maxDuration * extendedBuffer.sampleRate; // Sample length based on max duration

          const offlineContext = new OfflineAudioContext(
            1,
            sampleLength,
            44100
          );
          const gainNode = offlineContext.createGain();
          gainNode.gain.value = 1;
          const source = offlineContext.createBufferSource();
          source.buffer = extendedBuffer;

          const pitchShifter = new PitchShifter(
            offlineContext,
            extendedBuffer,
            4096
          );
          pitchShifter.tempo = playbackRate;
          pitchShifter.pitch = pitch;

          // order matters here
          source.connect(pitchShifter.node);
          pitchShifter.connect(gainNode);
          gainNode.connect(offlineContext.destination);

          source.start();

          offlineContext
            .startRendering()
            .then((renderedBuffer) => {
              // The renderedBuffer contains the pitch-shifted audio data.
              // Can be converted to MP3 or any desired format for streaming.

              // Scratch3Mv2Blocks.increaseVolume(
              //   renderedBuffer,
              //   util.target.volume / 30
              // );

              const mp3SoundBuffers = this.convertSoundToMP3(
                renderedBuffer
              );
              const mp3SoundData = this.convertMp3BufferToData(
                mp3SoundBuffers
              );
              if (martyConnector.isConnected()) {
                // @ts-expect-error
                martyConnector.streamAudio(Array.from(mp3SoundData), maxDuration * 1000);
              } else {
                // play locally
                const base64Audio = this.arrayBufferToBase64(mp3SoundData);
                const dataURL = `data:audio/mp3;base64,${base64Audio}`;
                const audio = new Audio(dataURL);
                audio.play();
              }

              const timeout = setTimeout(() => {
                clearTimeout(timeout);
                resolve(true);
              }, maxDuration * 1000 + 800);
            })
            .catch(async (err) => {
              console.warn(err);
              reject(err);
            });
        })
    });
  }

  static convertSoundToMP3(audioBuffer) {
      const sampleRate = 44100;
      const sampleRatio = audioBuffer.sampleRate / sampleRate;
      const finalLen = Math.floor(audioBuffer.length / sampleRatio);
      const rawSoundData = new Int16Array(finalLen);
      const inSoundData = audioBuffer.getChannelData(0);
      for(let i = 0; i<finalLen; i++) {
      // Nominal range of AudioBuffer data is -1.0 to +1.0 (each sample is a 32 bit float)
      rawSoundData[i] = inSoundData[Math.floor(i * sampleRatio)] * 32767;
    }

    //can be anything but make it a multiple of 576 to make encoders life easier
    const sampleBlockSize = 1152;
    // const bitRate = mv2Interface.mp3EncodingBitRate || 16;

    const bitRate = 64;
    const avgFlag = true;
    // @ts-expect-error
    const mp3encoder = new lamejs.Mp3Encoder(1, sampleRate, bitRate, avgFlag);
    const mp3Data = [];
    for (let i = 0; i < rawSoundData.length; i += sampleBlockSize) {
      const sampleChunk = rawSoundData.subarray(i, i + sampleBlockSize);
      const mp3buf = mp3encoder.encodeBuffer(sampleChunk);
      if (mp3buf.length > 0) {
        mp3Data.push(mp3buf);
      }
    }
    const mp3bufFlashed = mp3encoder.flush(); //finish writing mp3
    if (mp3bufFlashed.length > 0) {
      mp3Data.push(mp3bufFlashed);
    }
    return mp3Data;
  }

  static convertMp3BufferToData(mp3SoundBuffers) {
    let mp3Len = 0;
    for (const mp3Buf of mp3SoundBuffers) {
      mp3Len += mp3Buf.length;
    }
    const mp3SoundData = new Int8Array(mp3Len);
    let curPos = 0;
    for (const mp3Buf of mp3SoundBuffers) {
      mp3SoundData.set(mp3Buf, curPos);
      curPos += mp3Buf.length;
    }
    console.log(`encoded to MP3 len ${mp3SoundData.length}`);
    return mp3SoundData;
  }

  static arrayBufferToBase64(buffer) {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

}
