export function sleepAsync(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

export function errmsg(err: any): string {
  if (typeof err === 'undefined') return 'undefined'
  if (err === null) return 'null'
  if (typeof err === 'string') return err
  if (typeof err['message'] === 'string') {
    return err['message']
  }
  const msg = String(err)
  return msg ? msg : 'unknown'
}
