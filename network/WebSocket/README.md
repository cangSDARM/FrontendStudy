# WebSocket Learning

<!-- TOC -->

- [协议简介](#协议简介) - [tips:](#tips)
- [深入理解](#深入理解)
  - [和 HTTP/TCP 协议比较](#和httptcp协议比较)
  - [初始握手](#初始握手)
  - [对应头信息](#对应头信息)
  - [消息帧](#消息帧)
  - [关闭握手](#关闭握手)
  - [WebSocket 安全](#websocket安全)
  - [WebSocket 的部署](#websocket的部署)
    - [代理服务器问题](#代理服务器问题)
  - [非兼容时备用手段](#非兼容时备用手段)
- [生命周期](#生命周期)
  - [WebSocket API](#websocket-api)
    - [<span id="check">支持检查</span>](#支持检查)
    - [构造链接](#构造链接)
    - [<span id="onopen">事件：Open</span>](#事件open)
    - [<span id="onmessage">事件：Message</span>](#事件message)
    - [<span id="send">方法：send</span>](#方法send)
    - [<span id="onerror">事件：Error</span>](#事件error)
    - [<span id="close">方法：close</span>](#方法close)
    - [<span id="onclose">事件：Close</span>](#事件close)
    - [<span id="readyState">对象特性：readyState</span>](#对象特性readystate)
    - [<span id="bufferedAmout">对象特性：bufferedAmout</span>](#对象特性bufferedamout)
- [相关技术或文档](#相关技术或文档)

<!-- /TOC -->

## 协议简介

- 定义：是由**客户端主动发起链接**，**服务器响应链接**的**全双工**通信

##### tips:

1. 若要使用 wss, 和 https 类似, 需要证书
2. 使用 WebSocket 时不需要完全忽略 HTTP，静态资源需要通过 HTTP 加载
3. WebSocket API 不支持客户端手动`ping/pong`(但支持浏览器发起), 因此`ping`和`pong`通常由服务器发起; 通常 30s 发起一次`ping/pong`检查

## 深入理解

### 和 HTTP/TCP 协议比较

|   特性   |      TCP      |   HTTP    |    WebSocket     |
| :------: | :-----------: | :-------: | :--------------: |
|   寻址   | IP 地址和端口 |    URL    |       URL        |
| 并发传输 |    全双工     |  半双工   |      全双工      |
|   内容   |    字节流     | MIME 消息 | 文本和二进制消息 |
| 消息定界 |      否       |    是     |        是        |
| 链接定向 |      是       |    否     |        是        |

#####tips:

1. TCP 只能传输字节流，所以消息边界由高层协议来表现。所谓粘包，并不是 TCP 所需要定义的
2. websocket 协议内置消息边界，所以发送和接收没有所谓的"碎片"
3. 开放系统互联（OSI）七层模型设计时没有考虑互联网，互联网的 TCP/IP 模型只有：链路层、互联网层、传输层和应用层
4. IP(互联网层)-> TCP(传输层) -> Websocket、http(应用层)

### 初始握手

1. 使用普通 http 请求(GET)，携带`Upgrade; Sec-WebSocket-Version; Sec-WebSocket-Key`等必须的头进行初始握手(opening handshake)
2. 服务器响应`Sec-WebSocket-Accept; 101 Switching Portocals; Upgrade`头

### 对应头信息

|               首标               | 响应/请求 |                                                                                                        描述                                                                                                         |
| :------------------------------: | :-------: | :-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
|        Sec-WebSocket-Key         |   请求    |                                                                            避免无意义的 http 连接(浏览器添加, 用户禁止手动添加该头信息)                                                                             |
|             Upgrade              | 请求/响应 |                                                                                       表示要升级到的协议, 值固定为`websocket`                                                                                       |
|            Connection            | 请求/响应 |                                                                                      表示需要升级协议(必须), 值固定为`Upgrade`                                                                                      |
|      Sec-WebSocket-Version       | 请求/响应 |                                                                    表示版本兼容性, 正常可行版本总是 13. 如果不支持, 服务器需要返回对应的支持版本                                                                    |
|     Sec-WebSocket-Extensions     | 请求/响应 |                                                                       协商 WebSocket 的协议级拓展。扩展允许添加自定义的帧头，需要浏览器标准化                                                                       |
|      Sec-WebSocket-Protocal      | 请求/响应 |                                                                                    协商更高级协议, 如 XMPP、STOMP、自定义协议等                                                                                     |
| HTTP/1.1 101 Switching Protocals |   响应    |                                                                                            表示服务器接受 WebSocket 连接                                                                                            |
|       Sec-WebSocket-Accept       |   响应    | 根据请求首部的 Sec-WebSocket-Key 计算出来. <br/> 用于表示服务器理解 WebSocket<br/> 固定公式: 将 Sec-WebSocket-Key 跟`258EAFA5-E914-47DA-95CA-C5AB0DC85B11`拼接; <br/>通过 SHA1 计算出摘要，并转成 base64 字符串返回 |

### 消息帧

> 每消息帧(frame)组成: 帧头 + 数据内容; 每内容(message)组成: 一帧或多帧(组帧, framing)<br/>
> WebSocket API 并不暴露帧级别信息

```html
0 byte 1 byte 2 byte 3 byte 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5
6 7 8 9 0 1 bit
+-+-+-+-+-------+-+-------------+-------------------------------+ |F|R|R|R|
opcode|M| Payload len | Extended payload length | |I|S|S|S| (4) |A| (7) |
(16/64) | |N|V|V|V| |S| | (if payload len==126/127) | | |1|2|3| |K| | |
+-+-+-+-+-------+-+-------------+ - - - - - - - - - - - - - - - + | Extended
payload length continued, if payload len == 127 | + - - - - - - - - - - - - - -
- +-------------------------------+ | | Masking-key, if MASK set to 1 |
+-------------------------------+-------------------------------+ | Masking-key
(continued) | Payload Data | +-------------------------------- - - - - - - - - -
- - - - - - + : Paylaod Data continued ... : + - - - - - - - - - - - - - - - - -
- - - - - - - - - - - - - - + | Payload Data continued ... |
+---------------------------------------------------------------+
<b> WebSocket 帧头 </b>
```

- **FIN**：1 个比特. 如果是 1, 表示这是消息(message)的最后一个分片(fragment); 反之不是
- **RSV1, RSV2, RSV3**：各占 1 个比特. 一般情况下全为 0. 当采用 WebSocket-Extension 时，这三个标志位才可以非 0，且值的含义由扩展进行定义. 如果出现非零的值，且并没有采用 WebSocket 扩展，连接出错
- **Opcode**: 4 个比特. 值决定了应该如何解析后续的数据载荷(data payload). 如果操作代码是不认识的, 那么接收端应该断开连接(fail the connection). 可选的操作代码如下：
  - 0x0：表示一个延续帧。表示本次数据传输采用了数据分片，当前收到的数据帧为其中一个数据分片。
  - 0x1：表示该帧消息类型为文本
  - 0x2：表示该帧消息类型为二进制
  - 0x3 - 0x7：保留的操作代码，用于后续定义的非控制帧
  - 0x8：表示连接断开
  - 0x9：表示这是一个 ping 操作
  - 0xA：表示这是一个 pong 操作
  - 0xB - 0xF：保留的操作代码，用于后续定义的控制帧
- **Mask**: 1 个比特. 表示是否要对数据载荷进行掩码操作. 从客户端向服务端发送数据时，需要对数据进行掩码操作；从服务端向客户端发送数据时，不需要. 且如果服务端接收到的数据没有进行过掩码操作，服务端需要断开连接.
  如果 Mask 是 1，那么在 Masking-key 中会定义一个掩码键(masking key), 并用这个掩码键来对数据载荷进行反掩码.
- **Payload length**：数据载荷的长度，单位是字节. 为 7 位，或 7+16 位，或 1+64 位.
  - _假设 x = Payload length_，如果：
    1. x 为 0~126：数据的长度为 x 字节。
    2. x 为 126：后续 2 个字节代表一个 16 位的无符号整数，该无符号整数的值为数据的长度。
    3. x 为 127：后续 8 个字节代表一个 64 位的无符号整数（最高位为 0），该无符号整数的值为数据的长度
  - 此外，如果 payload length 占用了多个字节的话，payload length 的二进制采用网络序(big endian，重要的位在前)
- **Masking-key**：0 或 4 字节(32 位). Mask 为 1，携带 4 字节的 Masking-key。如果 Mask 为 0，则没有 Masking-key。是由客户端挑选出来的 32 位的随机数
  - 载荷数据的长度，不包括 masking-key 的长度
  - 掩码、反掩码操作都采用相同算法:

```py
    j = i % 4     #i 是对应数据的第 i 位
    transformed[i] = original[i] xor maskingKey[j] #original_i为原始数据; transformed_i为转换后的数据; maskingKey为masking-key
```

- **Payload Data**：(x+y) 字节. 包括了扩展数据、应用数据。其中，扩展数据 x 字节，应用数据 y 字节.
  - 扩展数据：如果没有协商使用扩展的话，扩展数据数据为 0 字节。所有的扩展都必须声明扩展数据的长度，或者可以如何计算出扩展数据的长度。此外，扩展如何使用必须在握手阶段就协商好。如果扩展数据存在，那么载荷数据长度必须将扩展数据的长度包含在内。
  - 应用数据：任意的应用数据，在扩展数据之后（如果存在扩展数据），占据了数据帧剩余的位置。载荷数据长度 减去 扩展数据长度，就得到应用数据的长度

### 关闭握手

WebSocket 关闭时，终止连接的端点发送一个数字代码，用于表示错误信息<br/>
[错误号大全](https://github.com/Luka967/websocket-close-codes)

### WebSocket 安全

|        攻击类型        |                     解决办法                     |
| :--------------------: | :----------------------------------------------: |
|     拒绝服务(DoS)      | [Origin 头](http://www.ietf.org/rfc/rfc6454.txt) |
| 连接洪范拒绝服务(DDoS) |             用 Origin 首标限制新连接             |
|     代理服务器攻击     |                  掩码(Mask 帧)                   |
|      中间人, 窃听      |              WebSocket 安全(wss://)              |

### WebSocket 的部署

##### 代理服务器问题

| 代理服务器类型 | WebSocket |  连接结果  |                              考虑因素                              |
| :------------: | :-------: | :--------: | :----------------------------------------------------------------: |
|     无代理     |  ws/wss   |    成功    |                 WebSocket 在 C/S 间无中介可以成功                  |
|      显式      |    ws     | 失败或成功 |          需要显示代理服务器允许 CONNECT 方法, 连接不安全           |
|      显式      |    wss    |    成功    | 需要显示代理服务器允许 CONNECT 方法, 由于是 TLS 握手, 因此连接安全 |
|      透明      |    ws     |    失败    |                  透明代理服务器不理解 101 响应码                   |
|      透明      |    wss    |    成功    |              由于 TLS 是加密的, 因此透明代理只会转发               |

### 非兼容时备用手段

1. 浏览器插件: Adobe Flash 技术
2. Polyfill 库: Kaazing's Websoket, Modernizr's Polyfill

## 生命周期

### WebSocket API

| 事件                    | 方法            | 其他                            |
| ----------------------- | --------------- | ------------------------------- |
| [onopen](#onopen)       | [send](#send)   | [readyState](#readyState)       |
| [onmessage](#onmeesage) | [close](#close) | [bufferedAmout](#bufferedAmout) |
| [onerror](#onerror)     |                 | [支持检查](#check)              |
| [onclose](#onclose)     |                 |                                 |

#### <span id="check">支持检查</span>

```js
if (!window.WebSocket) {
  console.log(
    "is not support, please use Polyfill or Kaazing's websocket service.",
  );
}
```

#### 构造链接

```js
/**
 * 构造函数示例
 * @param url: 必须以ws:或者wss:开头的链接
 * @param protocal: 可选协议列表，包括XMPP/SOAP或其他自定义协议
 */
var ws = new WebSocket("ws://www.websocket.org", [protocal lists]);
```

#### <span id="onopen">事件：Open</span>

一旦服务器响应了 WebSocket 请求，则触发 open 事件

```js
//Evnet handler for the WebSocket connection opening
ws.onopen = function (e) {
  console.log(ws.protocal); //服务器响应的通讯协议
};
```

#### <span id="onmessage">事件：Message</span>

- 该事件在接收到消息时触发
- 输出完整消息，Websocket 帧由其他方式处理
- 可以处理：文本数据；Blob（二进制）数据；ArrayBuffer 数据

```js
//Event handler for receiving message
ws.onmessage = function (e) {
  if (typeof e.data === "string") {
    var text = e.data; //Websocket 文本消息使用 UTF-8 编码，且是唯一所允许的编码格式
  } else if (e.data instanceof "blob") {
    var blob = new Blob(e.data);
  } else if (e.data instanceof "arraybuffer") {
    var ab = new Uint8Array(e.data);
  }
};
```

#### <span id="send">方法：send</span>

发送信息给触发了 open 事件的服务器

```js
if (ws.readyState === WebSocket.OPEN) {
  //检查状态，确保链接已经打开
  ws.send("init data");
  ws.send(new Blob("blob"));
  ws.send(new Uint8Array([8, 5, 3, 4, 6]));
} else {
  //Possibly ignore the data or enquene it.
}
```

#### <span id="onerror">事件：Error</span>

- 在响应意外故障时触发
- 响应后 WebSocket 链接将关闭，触发 close 事件

```js
//Event handler for errors in the websocket object
ws.onerror = function (e) {
  console.log(e);
};
```

#### <span id="close">方法：close</span>

- 可以关闭链接或者终止链接尝试
- 对于已经关闭的链接，该方法什么都不做

```js
/**
 * 参数都是可选的
 * @param code: 1000表示正常关闭
 * @param reason: 文本字符串
 */
ws.close(1000, "reason");
```

#### <span id="onclose">事件：Close</span>

在链接关闭时触发

```js
//Event handler for closed connections
ws.onclose = function (e) {
  console.log(e.wasClean ? "表示链接是否是正常关闭" : null);
  console.log(e.code, e.reason, "表示服务器关闭的信息");
};
```

#### <span id="readyState">对象特性：readyState</span>

|       常量表示       | 取值 |           状态           |
| :------------------: | :--: | :----------------------: |
| WebSocket.CONNECTING |  0   |      链接正在建立中      |
|    WebSocket.OPEN    |  1   | 链接已建立，可以发送消息 |
|  WebSocket.CLOSING   |  2   |     链接正在关闭握手     |
|   WebSocket.CLOSED   |  3   |  链接已经关闭，不能打开  |

#### <span id="bufferedAmout">对象特性：bufferedAmout</span>

用于检查已经进入发送队列，但尚未发送到服务器的字节数（不包括协议组帧开销或其它缓冲）

```js
//10k mak buffer size
var THRESHOLD = 10240;
//Send only if the buffer is not full
if (ws.bufferedAmout < THRESHOLD) {
  ws.send("Data");
}
```

## 相关技术或文档

[Html WebSocket 权威指南 ©2014 源码](https://github.com/vjwang/WebSocketBook)<br/>

- XMPP(eXtensible Messaging and Presence Protocol) 可扩展消息与现场处理协议
  - strophe.js an XMPP library for JavaScript
  - converse.js Web-based XMPP/Jabber chat client
- STOMP(Simple (or Streaming) Text Orientated Messaging Protocol) 简单(流)文本定向消息协议
  - stomp-websocket STOMP client for Web browsers
- VNC(Virtual NetWork Computing) 虚拟网络计算
  - noVNC VNC client using H5
  - RFB(Remote Framebuffer) 远程帧缓冲
- AMQP(Advanced Message Queueing Protocal) 高级消息队列协议
