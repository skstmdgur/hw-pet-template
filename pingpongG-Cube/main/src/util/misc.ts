export function sleepAsync(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

export function errmsg(err: any): string {
  if (!err) return 'unknown'
  if (typeof err === 'string') return err
  if (typeof err['message'] === 'string') {
    return err['message']
  }
  return err.toString()
}
