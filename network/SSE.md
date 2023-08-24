# SSE

Server-Sent Events

[参考](https://zh.javascript.info/server-sent-events)

服务器发送事件(SSE)是服务器到客户端的单工通讯。但现在逐渐被 WebSocket 所替代。

要想实现 SSE，可以使用[EventSource](https://developer.mozilla.org/en-US/docs/Web/API/EventSource)标准 API 来实现。

对于 SSE 来说，**每个浏览器的最大限制为 6 个**，且只能发送文本消息

如果连接断开了， EventSource 会自动重新连接到服务器，还可以向服务器发送上一次接收到的消息 ID，以便服务器重传丢失的消息并恢复流

## 例子

[服务器端更新日志，并推送到客户端](https://github.com/amittallapragada/SSELoggerDemo)

关键部分:

```js
// SSE 支持跨源
const source = new EventSource("http://localhost:8000/stream-logs", {
  withCredentials: true
});
source.onmessage = function (event) {
  document.getElementById("logs").innerHTML += event.data + "<br>";
};
source.close();
```
