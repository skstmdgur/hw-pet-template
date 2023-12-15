import { Packet } from './ExMarsCubeDefine'

export class FIFO {
  private items: Array<Packet> = [[]]
  public length = 0

  constructor() {}

  enqueue = async(item: Packet): Promise<void> => {
    this.items.push(item)
    this.length = this.items.length
  }

  peek = (): Packet => {
    return this.items[0]
  }

  dequeue = async(): Promise<Packet> => {
    const buffer: Packet | undefined = this.items.shift()
    this.length = this.items.length
    return buffer ? buffer : []
  }

  clear = (): void => {
    this.items = []
    this.length = this.items.length
  }
}
