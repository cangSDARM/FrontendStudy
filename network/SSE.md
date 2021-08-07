# SSE

Server-Sent Events

服务器发送事件（SSE）是服务器到客户端的单工通讯。每当此数据流更新时，用户都可以实时看到新事件。但现在逐渐被 WebSocket 所替代。

本质上来说，要想实现 SSE，可以使用[EventSource](https://developer.mozilla.org/en-US/docs/Web/API/EventSource)标准 API 来实现。

对于 SSE 来说，**每个浏览器的最大限制为 6 个**

## 例子

[服务器端更新日志，并推送到客户端](https://github.com/amittallapragada/SSELoggerDemo)

关键部分:

```js
var source = new EventSource("http://localhost:8000/stream-logs");
source.onmessage = function (event) {
  document.getElementById("logs").innerHTML += event.data + "<br>";
};
```
