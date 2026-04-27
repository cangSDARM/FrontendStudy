- [Promise](#promise)
  - [两个内容](#两个内容)
  - [三种状态](#三种状态)
  - [在一个 Promise 链中](#在一个-promise-链中)
  - [例子](#例子)
  - [Thenable](#thenable)
  - [顺序处理](#顺序处理)
- [Async/Await](#asyncawait)
  - [基于 Promise 的更高层封装，可以将 Promise 链扁平化](#基于-promise-的更高层封装可以将-promise-链扁平化)
  - [async 函数返回永远是一个 Promise，然后像 Promise 一样使用](#async-函数返回永远是一个-promise然后像-promise-一样使用)
  - [await 串行写则是串行执行。前一个 await 完成后，后一个才会调用](#await-串行写则是串行执行前一个-await-完成后后一个才会调用)
- [生成器](#生成器)
  - [`throw` 错误进生成器](#throw-错误进生成器)
  - [`return` 终止生成器](#return-终止生成器)
  - [yield\* 用来展开生成器](#yield-用来展开生成器)
- [Async 和生成器混用](#async-和生成器混用)
- [扩展：Deferred](#扩展deferred)

## Promise

`new Promise(fun)`, 这个`fun`函数是**立即执行**的

### 两个内容

1. PromiseStatus：Promise 的状态
2. PromiseValue：Promise 的值

### 三种状态

1. 如果使用`Promise()`构造器创建一个`Promise`对象，<br/>它的状态是`pending`
2. 如果`resolve`方法被调用 或者 使用`Promise.resolve()`创建的`Promise`对象，<br/>其状态都是`fulfilled`
3. 如果`reject`方法被调用 或者 使用`Promise.reject()`创建的`Promise`对象，<br/>其状态都是`rejected`

- 如果是`pending`，其本身立马被压进 microtask 等待执行
- 如果是`fulfilled`或`rejected`，则其 then/catch 立马会被压进 microtask 等待执行

```js
//声明
const p = new Promise((resolve, reject) => {
  xx ? resolve(data) : reject(err);
});
const p = Promise.resolve();
const p = Promise.reject();
//调用
p.then((data) => {})
  .catch((err) => {})
  .then((data) => {})
  .finally();
//多个结束
let p = Promise.all([pa, pb]); //若有一个被 reject，立即被 reject。完全忽略列表中其他的 promise。其结果也被忽略
//竞赛
let p = Promise.race([pa, pb]); //只解析第一个的resolve/reject
//成功竞赛
let p = Promise.any([pa, pb]);  //then返回第一个成功的，其他的会被忽略。全部失败会返回一个AggregateError
//多个决议
let p = Promise.allSettled([pa, pb]); //then返回的Promise决议的结果, 允许resolve/reject混杂
```

|        resolve        |         reject         |
| :-------------------: | :--------------------: |
| 成功时调用, then 捕获 | 失败时调用, catch 捕获 |

> `then`和`catch`都接收一个回调函数，若传入非函数，则会忽略当前的 then 方法
> > `then`和`catch`回调函数中返回一个`非Promise`对象时，它会生成一个`状态为fulfilled的新Promise`对象，并将其 return，因此 catch 后也可以调用 then<br/>
> > `then`和`catch`如果返回一个`含有then方法`对象，则该对象被压进 microtask, 等待解析<br/>
> > **同一个 Promise 的多个`then`或`catch`会同时触发，相当于事件的 once**<br/>
> > `then`和`catch`及`fun`都包含隐式 try..catch。只要`throw Something`就会默认变成一个rejected的Promise给后面<br/>
> 异步

### 在一个 Promise 链中

- 如果状态变成了`fulfilled`，它会自动向后寻找：
  - 发现下一个`then`方法，执行其中`第一个参数的回调函数`；
- 如果状态变成了`rejected`，它会自动向后寻找：
  - 发现下一个`then`方法，执行其中`第二个参数的回调函数`；
  - 发现下一个`catch`方法，直接执行；
- 无论如何，finally 都会被调用，但不是最终结果。它会将上一个的结果透传给下一个，并忽略自己的返回结果

### 例子
```js
let p1 = Promise.resolve();
let p2 = p1.then(() => {
    console.log(0);
    let p3 = { then(resolve){ resolve(4) } };
    return p3;
});
let p4 = p2.then((res) => { console.log(res); });

let p5 = Promise.resolve();
let p6 = p5.then(() => { console.log(1); });
let p7 = p6.then(() => { console.log(2); });
let p8 = p7.then(() => { console.log(3); });
let p9 = p8.then(() => { console.log(5); });
let p10 = p9.then(() => { console.log(6); });

/*顺序:
p1, p5 -> fulfilled -> 其then压进microtask -> [p2, p6]
执行p2 -> 0 -> p3是pending其本身压进microtask, p2被block -> [p6, p3]
执行p6 -> 1 -> 其then压进microtask -> [p3, p7]
执行p3 -> fulfilled -> 其then压进microtask -> [p7, p3.then]
执行p7 -> 2 -> 其then压进microtask -> [p3.then, p8]
执行p3.then -> p2 为 fulfilled -> 其then压进microtask -> [p8, p4]
执行p8 -> 3 -> 其then压进microtask -> [p4, p9]
执行p4 -> 4 -> [p9]
执行p9 -> 5 -> 其then压进microtask -> [p10]
执行p10 -> 6
*/
```

### Thenable

Thenable 对象可以用`Promise.resolve(thenable)`转换为 Promise 对象

```js
function notifyMessageAsThenable(message, options) {
  return {
    // 和 new Promise 的格式相同
    'then': function (resolve, reject) {
      notifyMessage(message, options, function (error, notification) {
        if (error) {
          reject(error);
        } else {
          resolve(notification);
        }
      });
    }
  };
}
Promise.resolve(notifyMessageAsThenable("message")).then(console.log);
```

### 顺序处理
> taskA -> taskB -> taskC

```js
function sequenceTasks(tasks) {
    function recordValue(results, value) {
        results.push(value);
        return results;
    }
    var pushValue = recordValue.bind(null, []);
    return tasks.reduce(function (promise, task) {
        return promise.then(task).then(pushValue);
    }, Promise.resolve());
}
```

## Async/Await
[Async是如何被JavaScript实现的](https://juejin.cn/post/7069317318332907550)

### 基于 Promise 的更高层封装，可以将 Promise 链扁平化

```js
//before
function getColumn(url) {
  fetch(url)
    .then(response => response.json());
    .then(column => {
      console.log(`column detail: ${column.detail}`);
    })
    .catch(err=>{});
}
//after
async function getColumn(url) {
  try{
    const response = await fetch(url);
    const column = await response.json();
    if (response.status !== 200){
        throw new Error("response fail");
    }
    console.log(`column detail: ${column.detail}`)
  } catch(err) {
    console.error(err);
  }
}
```

> await 接收一个 Promise。当接收一个普通内容时，会自动将其转为 Promise.resolve<br/>
> await 返回 Promise 的 resolve 的值<br/>
> Async/Await 的错误需要自己增加判断逻辑，没有错误统一判断的 API<br/>
> 注意: try{}catch 只会捕获*awaited*的 Promise(return await promise 也可以, 但 return Promise 不会)<br/>

### async 函数返回永远是一个 Promise，然后像 Promise 一样使用

```js
//版本2
const getColumn = async (url) => {
  const response = await fetch(url);
  return await response.json();
};
getColumn("zhihu").then((column) => {
  console.log(`column detail: ${column.detail}`);
});
```

### await 串行写则是串行执行。前一个 await 完成后，后一个才会调用

```js
//before
async function show() {
  const zhihuColumn = await getColumn("zhihu"); //getColum基于返回Promise的，下同
  const baiduColumn = await getColumn("baidu");

  console.log(`zhihu column detail: ${zhihuColumn.detail}`);
  console.log(`baidu column detail: ${baiduColumn.detail}`);
}
//版本1
async function show() {
  const zhihuPromise = getColumn("zhihu");
  const baiduPromise = getColumn("baidu");

  const zhihuColumn = await zhihuPromise;
  const baiduColumn = await baiduPromise;

  console.log(`zhihu column detail: ${zhihuColumn.detail}`);
  console.log(`baidu column detail: ${baiduColumn.detail}`);
}
//版本2
async function show() {
  const [zhihuColumn, baiduColumn] = await Promise.all([
    getColumn("zhihu"),
    getColumn("baidu"),
  ]);

  console.log(`zhihu column detail: ${zhihuColumn.detail}`);
  console.log(`baidu column detail: ${baiduColumn.detail}`);
}
```

## 生成器

```js
function* func() {
  const a = yield "";
}
const gene = func();
let b = gene.next(A); //调用
let d = gene.next(B); //调用. 之后a=A
/* b = {value: "", done: false}
 * d = {value: undefined, done: true}
 */
```

> next()函数总会返回一个带有 value 和 done 属性的对象<br/>
> value 为返回值，done 则是一个 Boolean，用来标识 Generator 是否还能继续提供返回值

### `throw` 错误进生成器
也可以在 yield 出抛出一个 error。因为 error 本身也是一种结果
如果生成器内部有try-catch，则被内部(1)捕获，否则将抛出到外面调用的位置(2)

```js
function* gen() {
  try {
    let result = yield "2 + 2 = ?";// (1)
  } catch(e) {
    console.log(e);// (1)
  }
}

let g = gen();
try {
  g.throw(new Error("The answer is not found in my database"));// (2)
}catch(e) {
  console.log(e);// (2)
}
```

### `return` 终止生成器
generator.return(value) 终止生成器的执行(=直接跳到生成器最后一行)，并将给定的 value 返回给外部左值，不影响内部左值
如果我们在已完成的生成器上再次使用 generator.return()，它将再次返回该值

```js
function* gen() {
  let one = yield 1;
  console.log('one', one);  //never called
  let two = yield 2;  //never called
  console.log('two', two);  //never called
  let three = yield 3;  //never called
  console.log('three', three);  //never called

  console.log('end'); //never called
}
const g = gen();

g.next(); // { value: 1, done: false }
let foo = g.return('foo'); // { value: "foo", done: true }
g.next(); // { value: undefined, done: true }
let foo = g.return('foo'); // { value: "foo", done: true }
```

### yield\* 用来展开生成器

```js
function* gen1() {
  yield 1;
  yield* gen2();
  yield 5;
}

function* gen2() {
  yield 2;
  yield 3;
  yield 4;
  return "won't be iterate";
}

for (let value of gen1()) {
  //for-of循环Generator不会循环return语句
  console.log(value);
}
/* 1, 2, 3, 4, 5 */
```

## Async 和生成器混用

```js
async function foo() {
    for(let i = 0; i < 3; i++) {
        await delay(300);
        yield
    }
}
async function bar() {
    for await(const _ of foo()) void;
}
```

## 扩展：Deferred

Deferred 对象是 Promise 的超集，可以手动触发
// 参考: https://github.com/shalldie/mini-dfd/blob/master/index.js
// https://github.com/jquery/jquery/blob/main/src/deferred.js

```js
function AsyncPromiseQueue() {
  var Deferred = Promise.defer();

  this.put = (value) => {
    var next = Promise.defer();
    // 手动触发 resolver
    ends.resolver.return({ head: value, tail: next.promise });
    ends.resolver = next.resolver;
  }
  this.get = () => {
    // 手动 get
    var result = ends.promise.get('head');
    ends.promise = ends.promise.get('tail');
    return result;
  }
}
```
