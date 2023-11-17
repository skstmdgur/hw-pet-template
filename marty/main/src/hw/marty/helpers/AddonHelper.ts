export enum ADDONS_ENUM {
    // devices' WhoAmI's for Robotical Standard Add-ons
    DISTANCE = "VCNL4200",
    LIGHT = "lightsensor",
    COLOUR = "coloursensor",
    IRFOOT = "IRFoot",
    LEDFOOT = "LEDfoot",
    LEDARM = "LEDarm",
    LEDEYE = "LEDeye",
    NOISE = "noisesensor",
    GRIPSERVO = "roboservo3",
}

export default class AddonHelper {
    static LED_ADDONS = {
        LEDFOOT: ADDONS_ENUM.LEDFOOT,
        LEDARM: ADDONS_ENUM.LEDARM,
        LEDEYE: ADDONS_ENUM.LEDEYE,
    }

    static ledIdMapping(id: string) {
        // map led position id to code id
        // the order starting from the top id is: 6 5 4 3 2 1 0 11 10 9 8 7
        const idNum = parseInt(id);
        const MAP = [6, 5, 4, 3, 2, 1, 0, 11, 10, 9, 8, 7];
        return MAP[idNum];
      }
}