<!-- TOC -->

- [废弃或提案](#废弃或提案)
  - [提案](#提案)
- [Web Worker](#web-worker)
- [跨域问题](#跨域问题)
- [黑魔法](#黑魔法)
- [函数式编程](#函数式编程)

<!-- /TOC -->

- [各种存储方案](./storages.md)

## 废弃或提案
> 这里放的是未归类的废弃或提案。有分类的应于对应条目查看
### 提案
- **WebTransport** 提案将允许在浏览器和服务器之间发送和接收数据，并在顶部使用常见 API 来实现其下的可插拔协议（尤其是基于QUIC）。该 API 与 WebSocket 相似，也是客户端和服务器的双向连接，但允许进一步减少客户端和服务器之间的网络通信延迟，并且还支持多个流、单向流、乱序和不可靠传输。使用场景包括使用不可靠且乱序的消息向服务器重复发送低延迟的游戏状态、从服务器到客户端的媒体片段的低延迟传输以及大多数逻辑在服务器上运行的云场景。
- **WebCodecs** Web的编解码方案
- **WebML** Web Machine-Learning

## Web Worker
> 现代浏览器的JavaScript**多线程环境**<br>
> 可以新建并将部分任务分配到`worker线程`并行运行, 两个线程可**独立运行, 互不干扰**. **通过自带的消息机制相互通信**<br>
> 数据的交互方式为**传递副本**，而不是直接共享数据<br>
> workers 运行在另一个全局上下文(self)中, 不同于当前的window<br>
> [参考文档](https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Workers_API/Using_web_workers)

```js
// 创建 worker
const worker = new Worker('work.js');   //构造函数采用 Worker 脚本的名称
// 启动 worker
worker.postMessage();
// 进程间交互
// 1. 向其他进程推送消息
worker.postMessage('Hello World');
// 2. 监听其他进程来的消息
worker.onmessage = function (event) {
  console.log('Received message ' + event.data);
}
// 错误处理(主进程中处理)
worker.onerror = function(event){
  console.log('该事件不会冒泡并且可以被取消；为了防止触发默认动作，worker 可以调用错误事件的 preventDefault()方法');
  console.log(event.message, event.filename, event.lineno);   
}
// 停止 worker
// 1. 在主进程中调用
worker.terminate();
// 2. 在 Worker 本身内部调用
self.close();
```
限制:<br>

+ 同源限制
+ 无法使用 document / window / DOM / parent
+ 无法加载本地资源
+ 更多参见: [Functions and classes available to workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Functions_and_classes_available_to_workers)

## 跨域问题
> 在另一个vscache.git(Django)中已经简要说明了CORS问题以及JSONP<br/>
> 这里是另一种解决方法: iframe + postMessage<br/>
> 参考: [CORS](https://developer.mozilla.org/zh-CN/docs/tag/CORS)

```js
window.onload=function(){   //主窗口发送
    window.frames[0].postMessage('message','http://lslib.com');
}
window.addEventListener('message', function(e){     //iframe接收
    if(e.source != window.parent) return;
    var color = container.style.backgroundColor;
    window.parent.postMessage( color, '*' );
}, false);
```
[参考资料](https://dwqs.gitbooks.io/frontenddevhandbook/content/)

## 黑魔法
- [异步构造函数](https://www.blackglory.me/async-constructor/)
- [自定义URL打开本地程序](https://www.lefer.cn/posts/12763/)
- [检测Devtools是否被打开](https://nocilol.me/archives/lab/check-browser-devtools-open/)

## 函数式编程
[高阶函数](https://segmentfault.com/a/1190000017569569)<br>
[柯里化](https://segmentfault.com/a/1190000006096034#articleHeader1)
