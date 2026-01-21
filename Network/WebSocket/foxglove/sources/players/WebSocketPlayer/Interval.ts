type IntervalId = ReturnType<typeof setInterval>;

export default class Timeout {
  #intervalId?: IntervalId;
  #timeoutId?: IntervalId;

  setInterval = (...args: Parameters<typeof setInterval>) => {
    this.#intervalId = setInterval(...args);
  }

  setTimeout = (...args: Parameters<typeof setTimeout>) => {
    this.#timeoutId = setTimeout(...args);
  }

  clear() {
    if (this.#intervalId) {
      clearInterval(this.#intervalId);
      this.#intervalId = undefined;
    }
    if (this.#timeoutId) {
      clearTimeout(this.#timeoutId);
      this.#timeoutId = undefined;
    }
  }
}
