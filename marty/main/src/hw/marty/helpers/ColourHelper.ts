export default class ColourHelper {
  static hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null
  }

  static getHueChroma(r, g, b) {
    const maxVal = Math.max(r, g, b)
    const minVal = Math.min(r, g, b)
    const chroma = maxVal - minVal
    let hue = 0
    if (r > g && r > b) {
      hue = (((g - b) / chroma) % 6) * 60
    } else if (g > b) {
      hue = ((b - r) / chroma + 2) * 60
    } else {
      hue = ((r - g) / chroma + 4) * 60
    }
    if (hue < 0) hue += 360
    return [hue, chroma]
  }

  static getColourHelper(addon) {
    // helper function to get the colour of a colour sensor
    let red, green, blue, clear, isOnAir
    for (const addonValKey in addon.vals) {
      const addonVal = addon.vals[addonValKey]
      if (addonValKey.includes('Red')) red = addonVal
      if (addonValKey.includes('Green')) green = addonVal
      if (addonValKey.includes('Blue')) blue = addonVal
      if (addonValKey.includes('Clear')) clear = addonVal
      if (addonValKey.includes('Air')) isOnAir = addonVal
    }
    if (isOnAir) return 'air'
    else {
      const colours = [
        { hue: [0, 10], chroma: [50, 200], clear: [40, 150], name: 'red' },
        {
          hue: [20, 50],
          chroma: [40, 300],
          clear: [100, 255],
          name: 'yellow',
        },
        {
          hue: [85, 160],
          chroma: [5, 100],
          clear: [25, 150],
          name: 'green',
        },
        {
          hue: [180, 220],
          chroma: [40, 230],
          clear: [55, 255],
          name: 'blue',
        },
        {
          hue: [200, 320],
          chroma: [0, 40],
          clear: [25, 150],
          name: 'purple',
        },
        {
          hue: [345, 361],
          chroma: [50, 200],
          clear: [40, 150],
          name: 'red',
        },
      ]

      const [hue, chroma] = this.getHueChroma(red, green, blue)
      for (const colour of colours) {
        if (
          colour.hue[0] <= hue &&
          hue <= colour.hue[1] &&
          colour.chroma[0] <= chroma &&
          chroma <= colour.chroma[1] &&
          colour.clear[0] <= clear &&
          clear <= colour.clear[1]
        ) {
          return colour.name
        }
      }

      return 'unclear'
    }
  }

  static getColourChannel(addon, channel: string) {
    for (const addonValKey in addon.vals) {
      const addonVal = addon.vals[addonValKey]
      if (addonValKey.toLocaleLowerCase().includes(channel.toLocaleLowerCase())) {
        return addonVal
      }
    }
    return null
  }
}
