let seq = 1

export function genId(): string {
  return (seq++).toString(36).replace('-', '_')
}
