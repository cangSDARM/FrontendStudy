# [Web Worker](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API)

<!-- TOC -->

- [Limitation](#limitation)
- [Common Interface](#common-interface)
- [Without separate file](#without-separate-file)

<!-- /TOC -->

现代浏览器的 JavaScript**多线程环境**

有

- Worker
- SharedWorker
- ServiceWorker

> 可以新建并将部分任务分配到`worker线程`并行运行, 两个线程可**独立运行, 互不干扰**. **通过自带的消息机制相互通信**<br>
> 数据的交互方式为**传递副本**，而不是直接共享数据<br>
> workers 运行在另一个全局上下文(self)中, 不同于当前的 window<br> > [in react](https://github.com/async-library/react-webworker/blob/master/src/index.js)

### Limitation

- 同源限制
- 无法使用 window / DOM / parent
- 无法加载本地资源
- 更多参见: [Functions and classes available to workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Functions_and_classes_available_to_workers)

### Common Interface

```js
// 创建 worker
const worker = new Worker("work.js"); //构造函数采用 Worker 脚本的名称
// 启动 worker
worker.postMessage();
// 进程间交互
// 1. 向其他进程推送消息
worker.postMessage("Hello World");
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

- Service-Worker, 监听 event、fetchProxy 和 Cache 处理
  - [Part1, ValiaJS](https://ithelp.ithome.com.tw/articles/10216819)
  - [Part2, React](https://juejin.im/post/6881616183158636552)
  - [Part3, Workbox](https://developers.google.cn/web/tools/workbox)