# WebRTC

<!-- TOC -->

- [重要名词](#重要名词)
  - [NAT 穿透](#nat-穿透)
  - [应用层协议](#应用层协议)
  - [会话描述](#会话描述)
- [建立媒体会话](#建立媒体会话)
  - [建立 WebRTC 会话](#建立-webrtc-会话)
  - [通过 offer 和 answer 交换 SDP 描述符](#通过-offer-和-answer-交换-sdp-描述符)
  - [通过 ICE 框架建立 NAT/防火墙穿越的连接](#通过-ice-框架建立-nat防火墙穿越的连接)
- [通过 RTCDataChannel 来传输任意数据](#通过-rtcdatachannel-来传输任意数据)

<!-- /TOC -->

Web 实时通信技术(Web Real-Time Communication)<br>

> 允许网络应用或者站点，在不借助中间媒介的情况下，建立浏览器之间点对点（Peer-to-Peer）的连接，实现视频流和（或）音频流或者其他任意数据的传输

1. WebRTC 使用 UDP 协议传输信息, 因此需要 STUN / TURN / ICE 等技术绕过 NAT 的限制, TURN 服务器也可以使用 TCP 来传输 WebRTC 信息
2. 使用[Adapter.js](https://github.com/webrtcHacks/adapter)，确保 Web 应用程序的兼容性
3. WebRTC 创建连接时，顺序十分重要。如果没按照正确步骤会导致连接失败
4. WebRTC 运行时，对于所有协议的实现都会强制执行加密功能，因此 WebRTC 处于 DTLS 上。WebRTC 客户端自动为每一端生成自已签名的证书。因此，也就没有证书链需要验证
5. WebRTC 仅提供了端到端的全套方案。网络拓扑需要应用解决

参考资料<br>

> [博客|WebRTC 介绍及简单应用](https://www.cnblogs.com/vipzhou/p/7994927.html)<br>
> [PeerJs|简化RTCConnection的管理(offer/answer)](https://peerjs.com/)

## 重要名词

**信令信息(Signaling information)**

> 是指通信系统中的控制指令。用于指导终端、交换系统及传输系统协同运行，在指定的终端之间建立临时的通信信道，并维护网络本身正常运行。除了通信时的用户信息（包括话音信息和非话业务信息）以外的控制交换机动作的信号，就是信令信息<br />
> 信令服务器的作用是作为一个中间人帮助双方在尽可能少的暴露隐私的情况下建立连接。信令服务器仅在建立连接、ICE 时提供消息中转，其消息内容对信令服务器不重要

### NAT 穿透

处于安全原因，通常 UDP 协议没法穿透 NAT，因此 WebRTC 要工作的话，需要绕过其限制

**NAT(Network Address Translation)**

> 网络地址转换，用于代理服务

**ICE(Interactive Connectivity Establishment)**

> 交互式链接技术。允许实时对等端发现对方并且开启、维持彼此连接的框架<br/>
> [参考](https://webrtc.org.cn/three-things-about-ice/)

**STUN(Session Traversal Utilities for NAT)**

> NAT 会话传输应用程序协议<br>
> 允许位于 NAT (或多重 NAT)后的客户端建立 UDP 通信。使用 STUN 服务器绑定双方 Ip 和端口号，以此为 NAT 指明转发方式、保证转发在 UDP 连接时不超时<br >
> 但当防火墙完全屏蔽 / NAT 不支持时，STUN 将失败

**TURN 服务器(Traversal Using Relays around NAT 服务器)**

> TURN 服务器用于中间人转播消息，对双方透明<br >
> 两端向同一 TURN 中继服务器请求并建立连接，TURN 负责填充 NAT 所需的 Ip 和端口号，并转发 UDP / TCP 信息到 NAT，实现 NAT 穿透

### 应用层协议

用于修补 UDP 的部分不足，以提供足够够用的可靠交付

**DTLS(Datagram Transport Layer Security)**

> 数据报传输层安全。用于在 UDP 协议上实现加密安全

**SCTP(Stream Control Translation Protocol)**

> 流传输控制协议。提供基于不可靠传输业务的协议之上的可靠的数据报传输协议。WebRTC 使用它传输除媒体数据外的所有数据<br/>
> SCTP 是一个传输层协议，直接在 IP 协议上运行，这一点跟 TCP 和 UDP 类似。但 WebRTC 里，它位于 DTLS/UDP 上

**SRTP(Secure Real-Time Transport Protocol)**

> 安全实时传输协议。通过 IP 网络交付音频和视频等实时媒体数据的标准。负责把数字化的音频采样和视频帧用一些元数据封装起来，以辅助接收方处理这些流

**SRTCP(Secure Real-time Control Transport Protocol)**

> 安全实时控制传输协议。通过 SRTP 流交付发送和接收方统计及控制信息

### 会话描述

WebRTC 仅提供了流传输时的逻辑，其上的编码、数据加密等需要会话描述来解决

**SDP(Session Description Protocol)**

> 会话描述协议，用于描述不同内容的会话并向系统提供标准 API。SDP 仅为 WebRTC 提供标准接口，以给上面的 ICE、信令信息、数据等提供标准接口。数据的解析格式需要自己指定

**MCU(Multi Control Unit)**

> 多点控制单元。为了实现多点会议电视系统，必须设置 MCU。MCU 实质上是一台多媒体信息交换机，进行多点呼叫和连接，实现视频广播、视频选择、音频混合、数据广播等功能，完成各终端信号的汇接与切换

参考：[三款基于 WebRTC 的 MCU 框架](https://blog.csdn.net/xiaoluer/article/details/79088416)<br> > [licode](https://github.com/lynckia/licode) / [Kurento](https://github.com/Kurento) / [jitsi](https://github.com/jitsi)

## 建立媒体会话

### 建立 WebRTC 会话

1. 获取本地媒体
   - `MediaStream()`(包含多个同步的`MediaStreamTrack`)
2. 建立信令通道 *(可选)*，及对等链接
3. 在浏览器和对等终端建立链接
   - **意指不通过服务器，而是直接在两个终端之间建立链接。每一对浏览器都需要一个对等链接才能加入会议**
   - 建立此链接需要一个新的`RTCPeerConnection`对象
   - 在建立 RTCPeerConnection 实例之后，想要建立点对点的信道，需要做两件事:
     - 确定本机上的媒体流的特性，如分辨率、编解码能力等（SDP 描述符）[通过 Offer/Answer 交换](#通过-offer-和-answer-交换-sdp-描述符)
     - 连接两端的主机的网络地址（ICE Candidate）[使用 ICE 处理连接](#通过-ice-框架建立-nat防火墙穿越的连接)
4. 关联新媒体和数据通道至该链接
   - 每次更改媒体时，都需要在两个终端之间协商如何在链接通道中表示媒体
   - 使用`RTCSessionDescription`对象表示提议和应答
   - 相应的`RTCSessionDescription`对象存放会话描述和媒体表示，这样浏览器就可处理编解码器和编写 SDP 等复杂工作
5. 交换会话描述
   - 当终端交换完毕`RECSessionDescription`对象后，就可建立媒体会话
6. 交换多媒体流
   - 加入流非常容易，API 会负责流的建立和发送。
   - 当另一方在对等连接中加入流时，会发送提醒，通知第一个用户有变更。
   - 浏览器使用`onaddstream`来通知用户流已加入
   - 使用`RTCDataChannel`来在两者之间建立一个双向数据通道的连接，[传输任意数据，而非仅仅是媒体流](#通过-rtcdatachannel-来传输任意数据)
7. 关闭链接
   - 任何一端都可以关闭链接。
   - 通过对`RTCPeerConnection`对象调用 close()来关闭，用来停止 ICE 处理和媒体流传输

### 通过 offer 和 answer 交换 SDP 描述符

|                                                  对象发起方（甲）                                                  |                                                 对象接收方（乙）                                                 |
| :----------------------------------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------------------------------------: |
|                                      **1**. 建立一个 PC (PeerConnection) 实例                                      |                                     **1**. 建立一个 PC (PeerConnection) 实例                                     |
|                   **2**. 通过 PC 所提供的 createOffer()方法建立一个包含 SDP 描述符的 offer 信令                    | **5**. 将甲的 offer 信令中所包含的的 SDP 描述符提取出来，通过 PC 所提供的 setRemoteDescription()方法交给 PC 实例 |
|                    **3**. 通过 PC 所提供的 setLocalDescription()方法，将 SDP 描述符交给 PC 实例                    |               **6**. 通过 PC 所提供的 createAnswer()方法建立一个包含应答的 SDP 描述符 answer 信令                |
|                                       **4**. 将 offer 信令通过服务器发送给乙                                       |                   **7**. 通过 PC 所提供的 setLocalDescription()方法，将 SDP 描述符交给 PC 实例                   |
|                                                                                                                    |                                     **8**. 将 answer 信令通过服务器发送给甲                                      |
| **9**. 接收到乙的 answer 信令后，将其中乙的 SDP 描述符提取出来，调用 setRemoteDescripttion()方法交给自己的 PC 实例 |                                                                                                                  |
|                                                  **10**. 完成连接                                                  |                                                 **10**. 完成连接                                                 |

### 通过 ICE 框架建立 NAT/防火墙穿越的连接

> WebRTC 使用 ICE 框架来获得这个外界可以直接访问的地址，在创立 PC 的时候可以将 ICE 服务器的地址传递进去

1. 甲、乙各创建配置了 ICE 服务器的 PC 实例，并为其添加`onicecandidate`事件回调
2. 当网络候选可用时，将会调用`onicecandidate`函数
3. 在回调函数内部，甲或乙将网络候选的消息封装在 ICE Candidate 信令中，通过信令服务器中转，传递给对方
4. 甲或乙接收到对方通过信令服务器中转所发送过来 ICE Candidate 信令时，将其解析并获得网络候选，将其通过 PC 实例的`addIceCandidate()`方法加入到 PC 实例中

## 通过 RTCDataChannel 来传输任意数据

WebRTC 会处理所有连接问题. 一旦信令完成连接建立, 则自动处理

`RTCDataChannel`基于 SCTP/DLTS/UDP，提供不可靠或部分可靠的加密通信

> 为方便处理, dataChannel 很多 API 和 WebSocket 近似, 但发送协议和路径完全不同

```js
var peerConn = new RTCPeerConnection();
var dataChannel = peerConn.createDataChannel("channelName", options);
dataChannel.onopen = (e) => {};
dataChannel.onmessage = (e) => {
  if (e.data instanceof Blob) {
  } //dataChannel 可以处理: String, Blob, ArrayBuffer, ArrayBufferView

  dataChannel.send(data); //发送数据
  dataChannel.close(); //关闭通道
};
dataChannel.onerror = (e) => {};
dataChannel.onclose = (e) => {};
```
