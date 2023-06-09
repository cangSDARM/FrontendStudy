- [核心概念](#核心概念)
- [浏览器流](#浏览器流)
  - [Pitfall](#pitfall)
  - [常用 API](#常用-api)
  - [浏览器内置流](#浏览器内置流)
- [Node 流](#node-流)
- [例子](#例子)
  - [基于事件的流](#基于事件的流)

## 核心概念

**转换流**: 包含一个可写流和一个可读流。用于将可写流转换为可读流

**背压(backpressure)**: 如果管道链中的任何组件暂时不能消费区块，那么它会通过管道链向后传播信号，直到最终原始源被告知减速。这种使流量正常化的过程称为背压

**T 型改造(tee)**: 关闭原流，创建两个新分支流

## 浏览器流

### Pitfall

数据出自可读流；进入可写流

浏览器流是 SPSC 的

`getReader`和`getWriter`返回的是一个新实例。因此如果其他地方要消费时，旧的必须调用`releaseLock()`释放才能用新的

### 常用 API

```js
// 可读流
// 在pull中写的就是拉流(通过controller实现控制)；start中写就是推流(一般是interval或事件驱动)
const readableStream = new ReadableStream({ start, pull, cancel });
const reader = readableStream.getReader();
// 读
const { done, value } = await reader.read();
// 读 -> 写
await readableStream.pipeTo(writableStream);
// 读 -> 任意流
readableStream
  .pipeThrough(readableStream)
  .pipeThrough(transformStream)
  .pipeThrough(writableStream);
// T 型改造
const [streamA, streamB] = readableStream.tee();
// 关闭
readableStream.cancel(); //cancel会立即关闭。没读完的后续流不可消费(要关闭读，但允许后续流消费完再关闭需要调用controller.close)

// 可写流
const writableStream = new WritableStream({ start, write, close, abort });
const writer = writableStream.getWriter();
// 写
const resultPromise = writer.write("第一个区块！");
// 关闭
await writableStream.close(); //close返回一个Promise。写完后会正常关闭
writableStream.abort(); //abort立即关闭。丢弃没写完的

// 转换流
const transformStream = new TransformStream({ start, transform, flush }); // flush = 队尾一次write + close

// 控制器
// 控制器通常是 start,pull,transform,write 的参数。
function pull(controller) {
  await controller.close(); //关闭流
  controller.enqueue(); //压入数据
  controller.error(new Error("")); //异常终止
}
```

### 浏览器内置流

```js
const blobStream = new Blob(["hello world"], { type: "text/plain" }).stream();
const fetchStream = (await fetch("xx")).body;
const fileStream = document.querySelector("input").files[0].stream();

// 字符编码、解码
const { body: bodyReadableStream } = await fetch("/xx", {
  method: "POST",
  body: textStream.pipeThrough(new TextEncoderStream()),
});
const textDecoderStream = bodyReadableStream.pipeThrough(
  new TextDecoderStream(),
);

// 压缩、解压缩
const compressionStream = bodyReadableStream.pipeThrough(
  new CompressionStream("gzip"),
);
const decompressStream = blobStream.pipeThrough(
  new DecompressionStream("gzip"),
);

// 串行API
const port = await navigator.serial.requestPort();
await port.open({ baudRate: 9_600 });
const reader = port.readable.getReader();
// 监听来自串行设备的数据。
while (true) {
  const { value, done } = await reader.read();
  if (done) {
    // 允许串行端口稍后关闭。
    reader.releaseLock();
    break;
  }
  // 值为 Uint8Array。
  console.log(value);
}
// 写入到串行端口。
const writer = port.writable.getWriter();
await writer.write(new Uint8Array([104, 101, 108, 108, 111])); // 你好
// 允许串行端口稍后关闭。
writer.releaseLock();
```

## Node 流

```js
// 拉流模型
stream.on("readable", function () {
  var chunk;
  while ((chunk = stream.read())) {
    pulledData += chunk;
  }
});

// 推流模型
stream.on("data", function (chunk) {
  pushedData += chunk;
});
```

## 例子

### 基于事件的流

浏览器：

```js
function makeReadableWebSocketStream(url, protocols) {
  let websocket = new WebSocket(url, protocols);
  websocket.binaryType = "arraybuffer";

  return new ReadableStream({
    start(controller) {
      websocket.onmessage = (event) => controller.enqueue(event.data);
      websocket.onclose = () => controller.close();
      websocket.onerror = () =>
        controller.error(new Error("The WebSocket errored"));
    },
  });
}
```
