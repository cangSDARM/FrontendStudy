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
      const rest = await test(fn(), i);
      if (rest) return;
      i++;
    } catch {}
  }
  throw new Error("max times when retry");
}

/**
 * [Retry in JS](https://lihautan.com/retry-async-function-with-callback-promise/), [Dart](https://stackoverflow.com/questions/56328814/how-can-i-retry-a-future-in-dart-flutter)
 * @param queryFn returns `false`, it waits for 1.5s*times and invokes `queryFn` again until `queryFn` returns `true`,
 * @param callback When `queryFn` returns `true`, invokes it and exit the function
 */
function simplePoller(
  queryFn: () => boolean,
  callback: (...args: any[]) => any
): void {
  delay(1000)
    .then(() =>
      retry(
        queryFn,
        (ret, times) => delay(1500 * (times + 1)).then(() => ret),
        Infinity
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
