async function delay(time: number = 1000): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}
async function retry<T>(
  fn: () => T,
  test: (ret: T, times: number) => Promise<boolean>,
  times: number = Infinity,
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
function simplePoller<T>(
  queryFn: () => boolean,
  callback: () => void,
): void {
  delay(1000)
    .then(() =>
      timeout(
        retry(
          queryFn,
          (ret, times) => delay(1500 * (times + 1)).then(() => ret),
          Infinity,
        ),
        1000
      ),
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
