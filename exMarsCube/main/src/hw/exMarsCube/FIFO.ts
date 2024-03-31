export class FIFO {
  private items = [[]]
  private length = 0

  enqueue = async(item: Array<number>): Promise<void> => {
    this.items.push(item)
    this.length = this.items.length
  }

  peek = (): Array<number> => {
    return this.items[0]
  }

  dequeue = async(): Promise<Array<number>> => {
    const buffer = this.items.shift()
    this.length = this.items.length
    return buffer ? buffer : []
  }

  count = (): number => {
    return this.length;
  }

  clear = (): void => {
    this.items = []
    this.length = this.items.length
  }
}
