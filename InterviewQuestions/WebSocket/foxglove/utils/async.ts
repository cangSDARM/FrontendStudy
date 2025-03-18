/** Error for promise timeouts from `promiseTimeout()` */
class PromiseTimeoutError extends Error {
  public override name = "PromiseTimeoutError";
}

/**
 * Executes a promise with a timeout.
 *
 * If the promise takes longer than the specified timeout duration (in milliseconds), it will be
 * rejected with a timeout error.
 *
 * Note: Make sure the input promise resolves, rejects, or otherwise go out of scope. A long-lived
 * promise that never resolves holds onto its resolution callbacks.
 *
 * @param promise The promise to execute
 * @param ms The timeout duration in milliseconds.
 * @returns A promise that resolves with the result of the input promise or rejects with a
 * PromiseTimeoutError.
 */
async function promiseTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  // We avoid using Promise.race here since it is susceptible to memory leaks for unresolved promises
  // https://github.com/nodejs/node/issues/17469
  //
  // With Promise.race you might be tempted to race the input promise against a promise that resolve
  // after a timeout. However, if you clear the timeout when the input promise resolves, you'll be
  // left with a promise that never resolves passed as a contender to `Promise.race`.
  return await new Promise<T>((resolve, reject) => {
    const id = setTimeout(() => {
      reject(new PromiseTimeoutError(`Promise timed out after ${ms}ms`));
    }, ms);
    promise.then(resolve, reject).finally(() => {
      clearTimeout(id);
    });
  });
}

export { promiseTimeout, PromiseTimeoutError };

type DebouncedFn<Args extends unknown[]> = ((...args: Args) => void) & {
  // the currently executing promise, if any
  currentPromise?: Promise<void>;
};

/**
 * The returned debounceFn ensures that only one `fn` call is executing at a time.
 * If debounceFn is called while `fn` is still executing, it will queue the call until the
 * current invocation is complete.
 * If debounceFn is called multiple times while `fn` is still executing, then only the last
 * call's arguments will be saved for the next execution of `fn`.
 *
 * @returns a function which wraps calls to `fn`.
 */
export function debouncePromise<Args extends unknown[]>(fn: (...args: Args) => Promise<void>): DebouncedFn<Args> {
  // Whether we are currently waiting for a promise returned by `fn` to resolve.
  let calling = false;
  // Whether another call to the debounced function was made while a call was in progress.
  let callPending: Args | undefined;

  const debouncedFn: DebouncedFn<Args> = (...args: Args) => {
    if (calling) {
      callPending = args;
    } else {
      start(args);
    }
  };

  function start(args: Args) {
    calling = true;
    callPending = undefined;

    debouncedFn.currentPromise = fn(...args).finally(() => {
      calling = false;
      debouncedFn.currentPromise = undefined;
      if (callPending) {
        start(callPending);
      }
    });
  }

  return debouncedFn;
}
