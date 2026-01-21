### 简单版

```ts
async function delay(time: number = 1000): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}
async function retry<T>(
  fn: () => T,
  test: (ret: T, times: number) => Promise<boolean>,
  times: number = Infinity
) {
  let i = 0;
  while (i < times) {
    try {
      const ret = fn();
      const tested = await test(ret, i);
      if (tested) return ret;
      i++;
    } catch {}
  }
  throw new Error("max times when retry");
}
async function timeout<T>(promise: Promise<T>, ms: number) {
  const timeout = delay(ms).then(function () {
    throw new Error("Operation timed out after " + ms + " ms");
  });
  return Promise.race([promise, timeout]);
}

/**
 * [Retry in JS](https://lihautan.com/retry-async-function-with-callback-promise/), [Dart](https://stackoverflow.com/questions/56328814/how-can-i-retry-a-future-in-dart-flutter)
 * @param queryFn returns `false`, it waits for 1.5s*times and invokes `queryFn` again until `queryFn` returns `true`,
 * @param callback When `queryFn` returns `true`, invokes it and exit the function
 */
function simplePoller<T>(queryFn: () => boolean, callback: () => void): void {
  delay(1000)
    .then(() =>
      timeout(
        retry(
          queryFn,
          (ret, times) => delay(1500 * (times + 1)).then(() => ret),
          Infinity
        ),
        1000
      )
    )
    .then(callback);
}

export default simplePoller;

// let now = Date.now();
// //case1
// simplePoller(()=>{
//   const newNow = Date.now();
//   console.log('test1', newNow - now);
//   now = newNow;
//   return true;
// }, () => {
//   console.log('finshed');
// });

// let now2 = Date.now();
// //case2
// let i = 0;
// simplePoller(()=>{
//   i++;
//   const newNow = Date.now();
//   console.log('test2', newNow - now2);
//   now2 = newNow;
//   if(i<2) return false;
//   return true;
// }, () => {
//   console.log('finshed');
// });
```

### Axios 兼容版

```ts
import { AxiosInstance, AxiosRequestConfig } from "axios";

type PollerState = "initial" | "stop" | "polling";

const CancelReason = "canceled by: stop";
class Controller<
  Opt extends {
    /** ms */
    interval: number;
    /** call early as it possible */
    eager?: boolean;
  } & AxiosRequestConfig
> {
  private state: PollerState = "initial";
  private timeoutId = -1;
  private abortCtl: AbortController | undefined;

  constructor(private inst: AxiosInstance, private axiosOption: Opt) {}

  stop = () => {
    this.state = "stop";
    this.abortCtl?.abort(CancelReason);
    if (this.timeoutId) {
      window.clearTimeout(this.timeoutId);
    }
  };

  request = (
    args: Opt["method"] extends "GET" | undefined ? Opt["params"] : Opt["data"]
  ) => {
    this.stop();
    this.state = "polling";

    const axiosOption = this.axiosOption;
    if (this.axiosOption.method === "GET") {
      axiosOption.params = args;
    } else {
      axiosOption.data = args;
    }

    let errorCallback: (error: unknown) => unknown = () => void 0;
    const endless = async (callback: (value: unknown) => unknown) => {
      let p,
        eagerPolled = false;
      while (true) {
        if (this.state === "stop") break;

        this.abortCtl = new AbortController();
        axiosOption.signal = this.abortCtl.signal;
        if (!eagerPolled && axiosOption.eager) {
          p = this.inst.request(axiosOption).then((res) => {
            return res.data;
          });
          eagerPolled = true;
        } else {
          p = new Promise((resolve, reject) => {
            this.timeoutId = window.setTimeout(() => {
              this.inst
                .request(axiosOption)
                .then((json) => {
                  resolve(json.data);
                })
                .catch(reject);
            }, axiosOption.interval);
          });
        }

        try {
          await p.then(callback);
        } catch (e) {
          if (process.env.NODE_ENV === "development") {
            console.error("polling error:", e);
          }
          errorCallback(e);
        }
      }
    };

    return {
      then: (callback: (value: unknown) => unknown) => {
        endless(callback);
      },
      catch: (callback: (error: unknown) => unknown) => {
        errorCallback = callback;
      },
    };
  };
}

export const pollerFactory = (inst: AxiosInstance) => {
  return function poller<
    const T extends {
      /** ms */
      interval: number;
      /** call early as it possible */
      eager?: boolean;
    } & AxiosRequestConfig
  >(options: T) {
    const controller = new Controller(inst, options);

    Object.seal(controller);
    return controller;
  };
};

export type PollerController = ReturnType<typeof pollerFactory>;
```
