import isVersionGreater from "./helpers/compare-version";
import { RICSystemInfo } from "@robotical/ricjs";


class soundStreamingProfile {
  bitRate: number;      // in kbps
  sampleRate: number;   // in Hz
  abr: boolean;         // Average Bit Rate encoding
  numWarnings: number;  // tracks number of streaming issues recorded for this profile

  constructor(bitRate: number, sampleRate: number, abr: boolean){
    this.bitRate = bitRate;
    this.sampleRate = sampleRate;
    this.abr = abr;
    this.numWarnings = 0;
  }

  addWarning(){
    this.numWarnings++;
  }
}

class MartySoundStreamingStats {
  private MAX_WARNING_PER_SETUP = 2;
  private RIC_VERSION_NEW_SOKTO_MODE = "1.2.52";

  // profiles must be listed in decreasing order by bitrate
  private soundStreamingProfiles = [new soundStreamingProfile(64,44100,true),
                                    new soundStreamingProfile(48,32000,true),
                                    new soundStreamingProfile(32,22050,true),
                                    new soundStreamingProfile(24,16000,true),
                                    new soundStreamingProfile(16,11025,true)];

  private currentSoundStreamingProfileIndex = 0;

  get getCurrentSampleRate() {
    return this.soundStreamingProfiles[this.currentSoundStreamingProfileIndex].sampleRate;
  }

  get getCurrentAvgFlag() {
    return this.soundStreamingProfiles[this.currentSoundStreamingProfileIndex].abr;
  }

  get getCurrentBitRate() {
    return this.soundStreamingProfiles[this.currentSoundStreamingProfileIndex].bitRate;
  }

  updateSetup() {
    if ((this.soundStreamingProfiles[this.currentSoundStreamingProfileIndex].numWarnings > this.MAX_WARNING_PER_SETUP) &&
        (this.currentSoundStreamingProfileIndex < (this.soundStreamingProfiles.length - 1))){

      this.currentSoundStreamingProfileIndex++;
    }
  }

  increaseWarning() {
    this.soundStreamingProfiles[this.currentSoundStreamingProfileIndex].addWarning();
    this.updateSetup();
  }

  // set bitrate to the next lowest option matching the passed-in bitrate
  // i.e. passing a bitRate of 60kbps will select 48kbps
  setBitRate(bitRate: number){
    for (let i=0; i < this.soundStreamingProfiles.length; i++){
      if (this.soundStreamingProfiles[i].bitRate <= bitRate){
        this.currentSoundStreamingProfileIndex = i;
        console.log(`Setting audio bitrate to ${this.soundStreamingProfiles[i].bitRate} kbps`);
        return true;
      }
    }
    return false;
  }

  configureSoundStreamingForRobot(systemInfo: RICSystemInfo, bleConnPerf: number | undefined){
    if (!systemInfo || !systemInfo.SystemVersion || !bleConnPerf) return;
    if (isVersionGreater(this.RIC_VERSION_NEW_SOKTO_MODE, systemInfo.SystemVersion)){
      this.setBitRate(16);
      return;
    }
    
    // bleConnPerf result is in bytes per second. Convert to kbps and pass to setBitRate
    // TODO: bleConnPerf result is not currently reliable
    //this.setBitRate(Math.floor(bleConnPerf*8/1024));
  }

  shouldUseLegacySoktoMode(systemInfo: RICSystemInfo){
    return isVersionGreater(this.RIC_VERSION_NEW_SOKTO_MODE, systemInfo.SystemVersion);
  }

}

export default MartySoundStreamingStats;
