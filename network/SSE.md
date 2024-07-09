Server-Sent Events
- [例子](#例子)
- [Post SSE](#post-sse)

[参考](https://zh.javascript.info/server-sent-events)

服务器发送事件(SSE)是服务器到客户端的单工通讯。但现在逐渐被 WebSocket 所替代。

要想实现 SSE，可以使用[EventSource](https://developer.mozilla.org/en-US/docs/Web/API/EventSource)标准 API 来实现。

对于 SSE 来说，**每个浏览器的最大限制为 6 个(现在是单页最大限制为 6 个)**，且只能发送 GET 请求及文本消息

如果连接断开了， EventSource 会自动重新连接到服务器，还可以向服务器发送上一次接收到的消息 ID，以便服务器重传丢失的消息并恢复流

## 例子

[服务器端更新日志，并推送到客户端](https://github.com/amittallapragada/SSELoggerDemo)

前端:

```js
// SSE 支持跨源
const source = new EventSource("http://localhost:8000/stream-logs", {
  withCredentials: true,
});
source.onmessage = function (event) {
  document.getElementById("logs").innerHTML += event.data + "<br>";
};
// SSE 可以支持消息分割。详情见后端
source.addEventListener("custom-event", (data) => {});
source.close();
```

后端:

```js
app.get("/sse", (req, resp, next) => {
  resp.set({ "Content-Type": "text/event-stream" });

  const stream = new PassThrough();

  setInterval(async () => {
    // sse 消息通过\n\n分割
    // event和data通过\n分割
    await stream.write(Buffer.from("event: custom-event\ndata: \n\n"));

    // 可以不写event，收到时只能通过onmessage处理
    await stream.write(Buffer.from("data: \n\n"));
  }, 1000);

  // 后端仅需要将 stream 挂载到 body 上即可
  resp.body = stream;
  next();
});
```

## Post SSE

SSE 只支持 Get 请求，但现代浏览器的 fetch 请求默认支持流，因此也可以达到类似功能

前端:

```ts
// 模拟event-source
type SSECallback = ((e: CustomEvent) => void) | null;
class SSE {
  private target = new EventTarget();
  private allEvent = "__all__";
  private index = -1;

  addEventListener(
    type: string,
    callback: SSECallback,
    options?: boolean | AddEventListenerOptions,
  ) {
    // @ts-ignore
    this.target.addEventListener(type, callback, options);
  }

  // 由于消息是流，因此不确定有多少分割的内容(但后端每次发送的消息必须是完整的)
  dispatch(value?: string) {
    if (!value) return;

    value.split("\n\n").forEach((val) => {
      const dataIdx = val.lastIndexOf("data");
      let event = "",
        data = "";

      event = val.substring(0, dataIdx - 1);
      data = val.substring(dataIdx);

      if (event) {
        data = data.replace("data: ", "").trim();
        event = event.replace("event: ", "").trim();
        this.target.dispatchEvent(
          new CustomEvent(event, { detail: JSON.parse(data) }),
        );
      } else {
        // means it's missing event
      }
    });
    this.target.dispatchEvent(
      new CustomEvent(this.allEvent, { detail: value }),
    );
  }

  onmessage(
    callback: SSECallback,
    options?: boolean | AddEventListenerOptions,
  ) {
    this.addEventListener(this.allEvent, callback, options);
  }

  onclose(callback: SSECallback, options?: boolean | AddEventListenerOptions) {
    this.addEventListener("close", callback);
  }

  close() {
    this.target.dispatchEvent(new Event("close"));
    this.target = new EventTarget();
    this.index = -1;
  }
}
const event = new SSE();
fetch("/sse", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({}),
}).then(async (response) => {
  const reader = response
    .body!.pipeThrough(new TextDecoderStream())
    .getReader();
  while (true) {
    const { value, done } = await reader.read();
    event.dispatch(value);

    if (done) break;
  }
});
```

后端:

```js
app.post("/sse", (req, resp, next) => {
  // 告诉浏览器这是分块的流
  resp.set({ "Transfer-Encoding": "chunked" });
  // 纯文本流
  resp.set({ "Content-Type": "text/plain" });

  const stream = new PassThrough();

  setInterval(async () => {
    // 一样
    await stream.write(Buffer.from("data: \n\n"));
  }, 1000);

  // 一样，后端仅需要将 stream 挂载到 body 上即可
  resp.body = stream;
  next();
});
```
