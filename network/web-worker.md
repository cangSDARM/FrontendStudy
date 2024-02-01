# [Web Worker](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API)

<!-- TOC -->

- [Limitation](#limitation)
- [Common Interface](#common-interface)
- [Without separate file](#without-separate-file)
- [Broadcast Channel](#broadcast-channel)

<!-- /TOC -->

现代浏览器的 JavaScript**多线程环境**

有

- [Broadcast Channel](#broadcast-channel)
- [ServiceWorker](#serviceworker)
- [SharedWorker](#sharedworker)

> 可以新建并将部分任务分配到`worker线程`并行运行, 两个线程可**独立运行, 互不干扰**. **通过自带的消息机制相互通信**<br>
> 数据的交互方式为**传递副本**，而不是直接共享数据<br>
> workers 运行在另一个全局上下文(self)中, 如tab、window、iframe、worker等<br>
> [in react](https://github.com/async-library/react-webworker/blob/master/src/index.js)

### Limitation

- 同源限制
- 无法使用 window / DOM / parent
- 无法加载本地资源
- 更多参见: [Functions and classes available to workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Functions_and_classes_available_to_workers)

### Common Interface

```js
// 创建 worker
const worker = new Worker("work.js"); //构造函数采用 Worker 脚本的名称
// 进程间交互
// 1. 向其他进程推送消息
// postMessage每次发消息都会序列化内容,如果数据量大时会产生性能问题. 参考[1](https://stackoverflow.com/questions/23237611/converting-javascript-2d-arrays-to-arraybuffer); [2](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/postMessage)
const buffer = new ArrayBuffer(1);
worker.postMessage({ data: buffer }, [buffer]);
// 2. 监听其他进程来的消息
worker.onmessage = function (event) {
  console.log("Received message " + event.data);
};
// 错误处理(主进程中处理)
worker.onerror = function (event) {
  console.log(
    "该事件不会冒泡并且可以被取消；为了防止触发默认动作，worker 可以调用错误事件的 preventDefault()方法",
  );
  console.log(event.message, event.filename, event.lineno);
};
// 停止 worker
// 1. 在主进程中调用
worker.terminate();
// 2. 在 Worker 本身内部调用
self.close();
```

### Without separate file

```typescript
const useWorker = () => {
  const blob = `(function(){
    self.onmessage = function(msg) {
      console.log('worker', msg)
      self.postMessage('worker response')
    }
  })()`;
  const worker = new Worker(
    window.URL.createObjectURL(new Blob([blob], { type: "text/javascript" })),
  );
  worker.postMessage("worker");
  worker.onmessage = console.log;

  return worker;
};

const worker = useWorker();
```

## Broadcast Channel

用于实现多个上下文间的单对多通信(`postMessage`是点对点)

但仅能用于同源的情况(跨域时还是得用`postMessage`)

```js
const bc = new BroadcastChannel("test_channel");
// 每个上下文都可以通过 postMessage 传入数据
bc.onmessage = function (e) {
  console.log("receive:", e.data);
};
bc.onmessageerror = function (e) {
  console.warn("error:", e);
};
// 广播给其他监听了的上下文
bc.postMessage('hello');
```

## ServiceWorker

- 监听 event、fetchProxy 和 Cache 处理
  - [Part1, VanillaJS](https://ithelp.ithome.com.tw/articles/10216819)
  - [Part2, React](https://juejin.im/post/6881616183158636552)
  - [Part3, Workbox](https://developers.google.cn/web/tools/workbox)

## SharedWorker

通常用于辅助监听`Websocket`, 以减轻服务器压力

同一个 url 只会创建一个`SharedWorker`, 其他上下文再使用同样的 url 创建`SharedWorker`, 会复用已创建的 worker, 这个 worker 由那几个页面共享

`SharedWorker`通过*port*来发送和接收消息

```js
// page.js
let worker = new SharedWorker("worker.js"); // 将执行的脚本 URL 的 DOMString
// page 通过 port 发送消息
worker.port.postMessage("哼哼");
// page 通过 port 接收消息
worker.port.addEventListener('message', (e) => console.log(e.data));
// 通过 addEventListener 添加的 message event, 需要手动 start
worker.port.start();
window.addEventListener("beforeunload", () => {
  worker.port.postMessage("unload");
});

// worker.js
const pool = [];
self.onconnect = function (e) {
  // 这里的 port 就是 page.js 的 port
  const port = e.ports[0];

  pool.push(port);

  port.onmessage = (e) => {
    // unload 要自己处理
    if (e.data === "unload") {
      const index = ports.findIndex((p) => p === port);
      pool.splice(index, 1);
    }
  };
};
const broadcast = (msg) => pool.forEach((port) => port.postMessage(msg));
```
