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
import { AxiosInstance } from "axios";
type SSECallback<D = any> = ((e: CustomEvent<D>) => void) | null;
/** internal event types
 *
 * @returns [chunk, miss, error]
 */
const SSEEvents = Object.seal({
  chunk: Symbol("__chunk__").toString(),
  miss: Symbol("__miss__").toString(),
  error: Symbol("__err__").toString(),
});

/** SSE: Server-Sent Event */
export const postSSEFactory =
  (instance: AxiosInstance) =>
  <B extends any = any>(
    url: string,
    body?: B,
    options?: Omit<RequestInit, "body" | "method">
  ) => {
    let target = new EventTarget(),
      index = -1,
      closed = false;

    function addEventListener(
      type: string,
      callback: SSECallback,
      options?: boolean | AddEventListenerOptions
    ) {
      // @ts-ignore
      target.addEventListener(type, callback, options);
    }

    /** **internal use only** */
    function dispatchChunk(value?: string) {
      index += 1;
      target.dispatchEvent(
        new CustomEvent(SSEEvents.chunk, { detail: { index, value } })
      );
    }

    /** **internal use only**
     *
     * FIXME: use https://www.npmjs.com/package/eventsource-parser Instead of writing it self
     */
    function dispatch(value?: string) {
      if (!value || closed) return;

      value.split("\n\n").forEach((val) => {
        if (val.trim() === "") return;
        try {
          const dataIdx = val.lastIndexOf("\ndata: ");
          let event = "",
            data = "";

          event = val.substring(0, dataIdx);
          data = val.substring(dataIdx);

          if (event) {
            data = data.replace("data: ", "").trim();
            event = event.replace("event: ", "").trim();
            target.dispatchEvent(
              new CustomEvent(event, { detail: JSON.parse(data) })
            );
          } else {
            data = event.replace("data: ", "").trim();
            target.dispatchEvent(
              new CustomEvent(SSEEvents.miss, { detail: JSON.parse(data) })
            );
          }
        } catch (e) {
          target.dispatchEvent(
            new CustomEvent(SSEEvents.error, { detail: { error: e, raw: val } })
          );
        }
      });
      dispatchChunk(value);
    }

    function close() {
      target.dispatchEvent(new Event("close"));
      target = new EventTarget();
      index = -1;
      closed = true;
    }

    const { headers = {}, ...restOptions } = options || {};
    fetch(instance.getUri({ url: url }), {
      method: "POST",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
      ...restOptions,
    }).then(async (response) => {
      const reader = response
        .body!.pipeThrough(new TextDecoderStream())
        .getReader();
      while (true) {
        const { value, done } = await reader.read();
        dispatch(value);

        if (done) {
          close();
          break;
        }
      }
    });

    return {
      addEventListener,
      close,
      events: SSEEvents,
      onclose(
        callback: SSECallback<undefined>,
        options?: boolean | AddEventListenerOptions
      ) {
        addEventListener("close", callback, options);
      },
      /** all "error" goes there
       *
       * the `event.detail` is the error self
       */
      onError(
        callback: SSECallback<unknown>,
        options?: boolean | AddEventListenerOptions
      ) {
        addEventListener(SSEEvents.error, callback, options);
      },
      /** all "no event" message goes there */
      onMiss(
        callback: SSECallback,
        options?: boolean | AddEventListenerOptions
      ) {
        addEventListener(SSEEvents.miss, callback, options);
      },
      /** Since a message is a flow, it is uncertain how much segmented content there is (but the message sent by the back end must be complete each time)
       *
       * the "chunk" meas the number of times received
       *
       * this event dispatched *after* the chunk been parsed and all valid infos been dispatched
       *
       * the `event.detail` the received raw value and the index of chunks
       */
      onChunk(
        callback: SSECallback<{ value: string; index: number }>,
        options?: boolean | AddEventListenerOptions
      ) {
        addEventListener(SSEEvents.chunk, callback, options);
      },
    };
  };

export type PostSSEController = ReturnType<typeof postSSEFactory>;
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
