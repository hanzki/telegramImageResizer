export function withTimeout<T>(ms: number, promise: Promise<T>): Promise<T> {
    const timer = new Promise<T>((resolve, reject) => {
        let wait = setTimeout(() => {
            clearTimeout(wait);
            reject(new TimeoutError(""))
        }, ms);
      });
      return Promise.race([
          promise,
          timer
      ]);
}

export class TimeoutError extends Error {
    constructor(public message: string) {
        super(message);
        this.name = "TimeoutError";
    }
}