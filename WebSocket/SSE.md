# SSE
Server-Sent Events

服务器发送事件（SSE）是服务器到客户端的单工通讯。每当此数据流更新时，用户都可以实时看到新事件。但现在逐渐被WebSocket所替代。

本质上来说，要想实现SSE，可以使用[EventSource](https://developer.mozilla.org/en-US/docs/Web/API/EventSource)标准API来实现。

对于SSE来说，**每个浏览器的最大限制为6个**

## 例子
[服务器端更新日志，并推送到客户端](https://github.com/amittallapragada/SSELoggerDemo)

关键部分:
```js
var source = new EventSource("http://localhost:8000/stream-logs");
source.onmessage = function(event) {
  document.getElementById("logs").innerHTML += event.data + "<br>";
};
```
