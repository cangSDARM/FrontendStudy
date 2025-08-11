<!-- TOC -->

- [导航时序规范](#导航时序规范)

<!-- TOC -->

- [Http](./http.md)
- [WebSocket](./WebSocket/README.md)
  - [SocketIo](./SocketIo.md)
- [WebRTC](./WebRTC/README.md)
- [Server-Sent-Event](./SSE.md)
- [Comet](./Comet.md)
- [Fetch/XHR and Related Streams](./fetch&XHR.md)
- [Browser Security](./browser-security.md)
- [WebWorker](./web-worker.md)
- [WebHook](./webhook.md)
- [SSO](./sso.md)
- [RPC](./rpc协议.md)

![layers](../assets/network-layer.png)

[图解 QUIC, TLS 1.2, TLS 1.3, DTLS 协议的连接及会话过程](https://cangsdarm.github.io/illustrate/)

> 为了统一网络传输时候的字节的顺序，TCP/IP 协议 RFC1700 里规定使用「大端」字节序作为网络字节序，所以，我们在开发网络通讯协议的时候操作 Buffer 都应该用大端序的 API，也就是 BE 结尾的

### [导航时序规范](https://www.w3.org/TR/navigation-timing/)

![guide](../assets/导航时序.png)

#### 应用层协议协商(ALPN, Application Layer Protocol Negotiation)

TLS 的扩展，用于减少通过 TLS 上层协议在 TLS 过程中的往返延迟

- 其步骤包含:
  1. 客户端在『Client hello』消息中追加一个新的『ProtocolNameList』字段，包含自己支持的应用协议。
  2. 服务器检查『ProtocolNameList』字段，并在『Server hello』消息中以『ProtocolName』字段返回选中的协议。

服务器可以从中选择一个协议名，否则如果不支持其中的任何协议，则断开连接。只要 TLS 握手完成、建立了加密信道并就应用协议达成一致，客户端与服务器就可以立即通信。
