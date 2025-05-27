- [核心概念](#核心概念)
- [浏览器流](#浏览器流)
  - [Pitfall](#pitfall)
  - [常用 API](#常用-api)
  - [浏览器内置流](#浏览器内置流)
- [Node 流](#node-流)
  - [常用 API](#常用-api-1)
  - [Consumers](#consumers)
- [例子](#例子)
  - [基于事件的流](#基于事件的流)
  - [BYOB](#byob)

## 核心概念

数据出自**可读流**: 进入**可写流**

**转换流**: 包含一个可写流和一个可读流。用于将可写流转换为可读流

**背压(backpressure)**: 如果管道链中的任何流暂时不能消费区块，那么它会通过管道链向上/后传播信号，直到最终原始源被告知并减速。这种使流量正常化的过程称为背压

**T 型改造(tee)**: 关闭原流，创建两个新分支流

## 浏览器流

### Pitfall

浏览器流是 SPSC 的

`getReader`和`getWriter`返回的是一个新实例。因此如果其他地方要消费时，旧的必须调用`releaseLock()`释放才能用新的

### 常用 API

```js
// 可读流
// 在pull中写的就是拉流(流内部队列空闲时，会自动调用pull)；start中写就是推流(一般是interval或事件驱动)
// 注意type='bytes'的，见 BYOB
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
// 写 (考虑背压，并忽略write的错误实现)
await writer.ready; // 在流从有背压转换到没有背压时resolve
const resultPromise = writer.write("第一个区块！").catch(handleValidErr); // 不await，忽略write实现
// 关闭
await writableStream.close(); //close返回一个Promise。写完后会正常关闭
writableStream.abort('reason'); //abort将流置于错误模式，并立即关闭。丢弃没写完的

// 转换流
const transformStream = new TransformStream({
  start,
  transform: function(chunk, controller) {},
  flush, // flush = 队尾一次write + close
});

// 控制器
// 控制器通常是 start,pull,transform,write 的参数。
function pull(controller) {
  await controller.close(); //关闭流
  if (!controller.desiredSize || controller.desiredSize <= 0) {
    // 内部队列超负荷或者出错，不应该enqueue
    return;
  }
  controller.enqueue(); //压入数据(若pull没有调用，则代表流完成，需要关闭)
  controller.terminate(); // (仅Transform有)。关闭可读端(输出)并使可写端(输入)出错。如果输入的剩余内容不感兴趣并希望跳过它们，则可以使用它。
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
  // encoder only support utf-8
  body: textStream.pipeThrough(new TextEncoderStream()),
});
const textDecoderStream = bodyReadableStream.pipeThrough(
  new TextDecoderStream("utf-8"),
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
try {
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    // 值为 Uint8Array。
    console.log(value);
  }
} finally {
  reader.releaseLock();
}
// 写入到串行端口。
const writer = port.writable.getWriter();
await writer.write(new Uint8Array([104, 101, 108, 108, 111])); // 你好
// 允许串行端口稍后关闭。
writer.releaseLock();
```

## Node 流

Node 流有 ReadableStream, WriteableStream, Duplex(可读可写, 内部两条流独立), Transform(可修改数据的 Duplex)

Node 流可以转变为 Web 流

### 常用 API

```js
const {
  // pipeline(read, duplex, duplex, write);
  // 会自动控制背压，保证stream的速率相似效率最高
  pipeline,
} = require("node:stream");

const nodeReadable = fs.createReadStream("text-file.txt", {
  encoding: "utf-8",
});
const webReadableStream = Readable.toWeb(nodeReadable); // node Read/Write Stream 都可以转换为 web 形式的流

const safeWrite = async (stream: Writable, content: Buffer) => {
  if (!stream.writable)
    return reject("stream has been destroyed, errored or closed");
  if (!content instanceof Buffer)
    return Promise.reject("recommending you send raw buffer to write");

  const contents: Buffer[] = [];
  for (let i = 0; i < content.length; i *= stream.writableHighWaterMark) {
    //大于 highWaterMark 的内容100%会触发drain。因此分割一下
    contents.push(content.subarray(i, i + stream.writableHighWaterMark));
  }

  for await (const chunk of contents) {
    if (!stream.write(chunk)) {
      // 返回false时
      // (内部buffer已到high watermark)应该等待drain事件，等stream清空内部buffer
      // 此时如果再写会导致内存过高
      await require("events").once(stream, "drain");
    }
  }
  return Promise.resolve();
};
stream.end(chunk); //最后一次写入，但不保证写完。写完后触发 finish 事件，并且之后不允许 write
const cleanup = finished(stream, (err) => cleanup());

// 读流可以被暂停，很适合用来减少后面写流的写入压力
stream.pause();
stream.resume();

// 拉流模型
stream.on("readable", function () {
  var chunk;
  while ((chunk = stream.read())) {
    pulledData += chunk;
  }
});

// 推流模型
// Buffer 到达 high watermark 后触发`data`事件
stream.on("data", function (chunk) {
  pushedData += chunk;
});

// 自己实现Stream
// - 不能内部emit自身的事件
// - 不能throw Error，需要callback(error)
class WriteStream extends Writable {
  // 会在 constructor 后调用
  _construct(cb) {}
  // 需要实现 _write/_read 方法
  // 每次外部调用 write 时，就会调用(因此需要自己控制读写频率)
  // 调用 callback 后会触发 drain
  _write(chunk, encoding, callback) {}
  // read出错时调用 this.destroy(err)
  //     成功时调用 this.push(data || null)，为null时就完成读取
  _read(size) {}
  // 每次都需要调用 callback(err, data)，或者 this.push(data); callback(err);
  _transform(chunk, encoding, callback) {}
  // 最后一次写入后调用(外面需要明确调用 end)
  // cb 后触发 finish
  _final(cb) {}
  // 销毁时调用
  _destroy(err, cb) {}
}
```

### Consumers

特殊的 Writeable 流。一次性读取流的所有内容(使用场景：如 io 紧张，但内存富足时)

```ts
import { arrayBuffer, blob, buffer, json, text } from "node:stream/consumers";

const readableByteStream = new ReadableStream({
  start(controller) {
    controller.enqueue('"😀"');
    controller.close();
  },
});
const jsonData = await json(readableByteStream);
assert.equal(jsonData, "😀");
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
    cancel: (reason) => websocket.close(reason),
  });
}
```

### BYOB

Bring Your Own Buffer。自己控制缓冲区(highWaterMark)

```ts
import { promisify } from "node:util";
import { randomFill } from "node:crypto";
const asyncRandomFill = promisify(randomFill);

const readableByteStream = new ReadableStream({
  type: "bytes",
  async pull(controller) {
    const byobRequest = controller.byobRequest;
    await asyncRandomFill(byobRequest.view);
    byobRequest.respond(byobRequest.view.byteLength);
  },
});

const reader = readableByteStream.getReader({ mode: "byob" });
const buffer = new Uint8Array(10); // (A)
const firstChunk = await reader.read(buffer); // (B)
console.log(firstChunk);
```
