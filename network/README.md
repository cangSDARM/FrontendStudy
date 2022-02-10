[Referer](https://juejin.cn/post/6844903608543084558)

<!-- TOC -->

- [导航时序规范](#导航时序规范)
- [TLS 协商](#tls-协商)

<!-- TOC -->

- [Http](./http.md)
- [WebSocket](./WebRTC/README.md)
- [WebRTC](./WebRTC/README.md)
- [Server-Sent-Event](./SSE.md)
- [Comet](./Comet.md)
- [Fetch/XHR and Related Streams](./fetch&XHR.md)
- [Same-Origin-policy](./Same-origin-policy.md)

![layers](../assets/network-layer.png)

#### [导航时序规范](https://www.w3.org/TR/navigation-timing/)

![guide](../assets/导航时序.png)

#### TLS 协商

TLS(传输层安全协定)

- 完整的 TLS 步骤包含:
  1. Client 向 Server 发送『Client hello』消息，一同发送的还包括客户端产生的随机值和支持的密码套件。
  2. Server 向 Client 发送『Server hello』消息，及服务器产生的随机值进行响应。
  3. Server 将其认证证书发送给 Client，并可能向 Clinet 请求类似的证书。同时发送『Server hello done』消息。
  4. 如果 Server 向 Clinet 请求了证书，则 Client 发送它。
  5. Client 创建一个随机的预主密钥(Pre-Master Secret)，并使用 Server 证书中的公钥对其进行加密，再将加密的预主密钥发送。
  6. Server 接收到预主密钥。Server 和 Client 根据预主密钥生成主密钥和会话密钥。
  7. Clinet 向 Server 发送『Change cipher spec』消息，提示 Client 将开始使用会话密钥进行散列和加密消息。同时发送『Client finished』消息。
  8. Server 收到『Change cipher spec』的消息，并使用会话密钥将其记录层安全状态切换为对称加密。向 Clinet 发送『Server finished』消息。
  9. Clinet 和 Server 现在可以通过安全的通道交换应用数据。所有从当前 Clinet 发送并返回的消息均使用会话密钥加密。

任何一步校验失败，用户都将会收到警告。例如，服务器正在使用自签名证书。
