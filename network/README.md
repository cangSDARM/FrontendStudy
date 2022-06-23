[Referer](https://juejin.cn/post/6844903608543084558)

<!-- TOC -->

- [导航时序规范](#导航时序规范)
- [TLS 协商](#tls-协商)

<!-- TOC -->

- [Http](./http.md)
- [WebSocket](./WebSocket/README.md)
- [WebRTC](./WebRTC/README.md)
- [Server-Sent-Event](./SSE.md)
- [Comet](./Comet.md)
- [Fetch/XHR and Related Streams](./fetch&XHR.md)
- [Same-Origin-policy](./Same-origin-policy.md)
- [WebWorker](./web-worker.md)

![layers](../assets/network-layer.png)

#### [导航时序规范](https://www.w3.org/TR/navigation-timing/)

![guide](../assets/导航时序.png)

#### TLS 协商

TLS(传输层安全协定)

- 完整的 TLS 步骤包含:
  1. Client 向 Server 发送『Client hello』消息，一同发送的还包括客户端产生的随机值和支持的密码/扩展套件。
  2. Server 向 Client 发送『Server hello』消息，及服务器产生的随机值进行响应。
  3. Server 将其认证证书发送给 Client，并可能向 Client 请求类似的证书。同时发送『Server hello done』消息。
  4. 如果 Server 向 Client 请求了证书，则 Client 发送它。
  5. Client 创建一个随机的预主密钥(Pre-Master Secret)，使用 Server 证书中的公钥对其进行加密，再将加密的预主密钥随『Change cipher spec』消息发送。
  6. Client 同时发送『Client finished』消息，提示 Client 将开始使用会话密钥进行散列和加密消息。
  7. 此时，除了用服务器公钥加密的预主密钥之外，所有数据都以明文形式发送。
  8. Server 接收到预主密钥。Server 和 Client 根据预主密钥生成主密钥和会话密钥。
  9. Server 收到『Change cipher spec』的消息，并使用会话密钥将其记录层安全状态切换为对称加密(对称加密更快)。向 Client 发送『Server finished』消息。
  10. Client 和 Server 现在可以通过安全的通道交换应用数据。所有从当前 Client 发送并返回的消息均使用会话密钥加密。

任何一步校验失败，用户都将会收到警告。例如，服务器正在使用自签名证书。

##### TLS 会话恢复

使用32位的会话标识符(SI, Session Identifier)，缩短 TLS 断开后，重新连接的时延

- 其步骤包含:
  1. Client 发送『Client hello』时，同时发送自己的SI。
  2. Server 验证后，在『Server hello』时发送自己的SI。
  3. 验证后，Client 和 Server 都可以跳过密钥交换部分。
  4. Server 同时发送『Server hello done』、『Server finished』消息。
  5. Client 收到后，发送『Client finished』消息。
  6. TLS 会话恢复完成，Client 和 Server 重用主密钥和会话密钥进行加密通信。

但服务器需要对所有SI维持缓存，因此有会话记录单(Session Ticket)扩展

- 其步骤包含:
  1. Server 发送『Server finished』的同时，添加一条公钥加密的『NewSessionTicket』，包含所有服务器维持会话的密钥/扩展套件需求。
  2. Client 保存记录单，在下次 TLS 会话恢复过程，随『Client hello』发送『SessionTicket』。
  3. Server 验证后，重用主密钥和会话密钥。

##### 服务器名称指示(SNI, Server Name Indication)

TLS 的扩展，允许客户端在握手之初就指明要连接的主机名，以支持单 IP 多站点(多TLS)的情况

##### 应用层协议协商(ALPN, Application Layer Protocol Negotiation)

TLS 的扩展，用于减少通过 TLS 上层协议在 TLS 过程中的往返延迟

- 其步骤包含:
  1. 客户端在『Client hello』消息中追加一个新的『ProtocolNameList』字段，包含自己支持的应用协议。
  2. 服务器检查『ProtocolNameList』字段，并在『Server hello』消息中以『ProtocolName』字段返回选中的协议。

服务器可以从中选择一个协议名，否则如果不支持其中的任何协议，则断开连接。只要 TLS 握手完成、建立了加密信道并就应用协议达成一致，客户端与服务器就可以立即通信。
