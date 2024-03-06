export function errmsg(err: any): string {
  if (typeof err === 'undefined' || err === null) return 'unknown'
  if (typeof err === 'string') return err
  if (typeof err['message'] === 'string') {
    return err['message']
  }
  return err.toString()
}

export function arrayIndexOf(src: Uint8Array, needle: Uint8Array): number {
  const needleLen = needle.length
  if (src.length < needleLen) return -1
  for (let i = 0; i < src.length - needleLen + 1; i++) {
    let found = true
    for (let k = 0; k < needle.length; k++) {
      if (src[i + k] !== needle[k]) {
        found = false
        break
      }
    }
    if (found) {
      return i
    }
  }
  return -1
}

export function arrayConcat(arr1: Uint8Array, arr2: Uint8Array): Uint8Array {
  const result = new Uint8Array(arr1.length + arr2.length)
  result.set(arr1)
  result.set(arr2, arr1.length)
  return result
}

export function sliceToUint8Array(src: number[], begin: number, end: number): Uint8Array {
  const len = end - begin
  if (len <= 0) {
    throw new Error(`illegal argument: begin=${begin}, end=${end}`)
  }
  const result = new Uint8Array(len)
  let pos = 0
  for (let i = begin; i < end; i++) {
    result[pos++] = src[i]
  }
  return result
}

export function clamp(v: number, min: number, max: number): number {
  if (v > max) return max
  if (v < min) return min
  return v
}

export function atMost(v: number, max: number): number {
  if (v > max) return max
  return v
}

export function atLeast(v: number, min: number): number {
  if (v < min) return min
  return v
}
