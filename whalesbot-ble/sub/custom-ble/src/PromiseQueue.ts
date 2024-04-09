interface QueuedPromise {
  fn: () => Promise<any>;
  resolve: (value?: any | PromiseLike<any> | undefined) => void;
  reject: (reason?: any) => void;
}

export class PromiseQueue {
  private queue: QueuedPromise[] = [];
  private running = 0;

  constructor(private concurrent = 1) {
    // empty
  }

  private async pump(): Promise<void> {
    if (this.running >= this.concurrent) {
      return;
    }

    const promise = this.queue.shift();

    if (!promise) {
      return;
    }

    this.running++;

    try {
      const result = await promise.fn();
      promise.resolve(result);
    } catch (error) {
      promise.reject(error);
    }

    this.running--;
    return this.pump();
  }

  public add<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({
        fn,
        resolve,
        reject,
      });

      this.pump().catch((err) => {
        console.log('ignore error', err);
      });
    });
  }
}
