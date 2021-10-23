- [Promise](#promise)
  - [两个内容](#两个内容)
  - [三种状态](#三种状态)
  - [在一个 Promise 链中](#在一个-promise-链中)
- [Async/Await](#asyncawait)
  - [基于 Promise 的更高层封装，可以将 Promise 链扁平化](#基于-promise-的更高层封装可以将-promise-链扁平化)
  - [async 函数返回永远是一个 Promise，然后像 Promise 一样使用](#async-函数返回永远是一个-promise然后像-promise-一样使用)
  - [await 串行写则是串行执行。前一个 await 完成后，后一个才会调用](#await-串行写则是串行执行前一个-await-完成后后一个才会调用)
- [生成器(协程)](#生成器协程)
  - [yield\* 用来展开迭代器](#yield-用来展开迭代器)
- [Async 和迭代器混用](#async-和迭代器混用)

# Promise Async Generator

[Concurrency in JS](https://advancedweb.hu/how-to-use-async-functions-with-array-map-in-javascript/)

## Promise

`new Promise(fun)`, 这个`fun`函数是**立即执行**的

### 两个内容

1. PromiseStatus：Promise 的状态
2. PromiseValue：Promise 的值

### 三种状态

1. 如果使用`Promise()`构造器创建一个`Promise`对象，<br/>它的状态是`pending`
2. 如果`resolve`方法被调用 或者 使用`Promise.resolve()`创建的`Promise`对象，<br/>其状态都是`resolved`
3. 如果`reject`方法被调用 或者 使用`Promise.reject()`创建的`Promise`对象，<br/>其状态都是`rejected`

```js
//声明
const p = new Promise((reslove, reject) => {
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
let p = Promise.all([pa, pb]); //只要有一个失败, 及返回reject
//竞赛
let p = Promise.race([pa, pb]); //只解析第一个的resolve/reject
//多个决议
let p = Promise.allSettled([pa, pb]); //返回的Promise决议的结果, 允许resolve/reject混杂
```

|        reslove        |         reject         |
| :-------------------: | :--------------------: |
| 成功时调用, then 捕获 | 失败时调用, catch 捕获 |

> `then`和`catch`都接收一个回调函数，若传入非函数，则会忽略当前的 then 方法<br/> > `then`回调函数中会把上一个 then 中返回的`PrmoiseValue`当做参数值供当前 then 方法调用<br/> > `then`回调函数中返回一个`非Promise`对象时，它会生成一个`状态为resolved的新Promise`对象，并将其 return<br/> > **`then`和`catch`返回的都是 Promise 对象，因此一个 Promise 也能链式调用**<br/>
> 异步

### 在一个 Promise 链中

- 如果状态变成了`resloved`，它会自动向后寻找：
  - 发现下一个`then`方法，执行其中`第一个参数的回调函数`；
- 如果状态变成了`rejected`，它会自动向后寻找：
  - 发现下一个`then`方法，执行其中`第二个参数的回调函数`；
  - 发现下一个`catch`方法，直接执行；
- 无论如何，finally 都会被调用

## Async/Await

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
        if (response.staus !== 200){
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

## 生成器(协程)

```js
function* func() {
  const a = yield "";
}
const gene = func();
let b = gene.next(A); //调用
let d = gene.next(B); //调用. 之后a=A
/* b = {value: "", done: false}
 * d = {value: undefined, done: ture}
 */
```

> next()函数总会返回一个带有 value 和 done 属性的对象<br/>
> value 为返回值，done 则是一个 Boolean，用来标识 Generator 是否还能继续提供返回值

### yield\* 用来展开迭代器

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

## Async 和迭代器混用

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
