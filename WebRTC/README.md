# WebRTC
<!-- TOC -->

- [重要名词](#重要名词)
- [建立媒体会话](#建立媒体会话)
  - [建立WebRTC会话](#建立webrtc会话)
  - [<span id="changeSDP">通过offer和answer交换SDP描述符</span>](#通过offer和answer交换sdp描述符)
  - [<span id="iceHandle">通过ICE框架建立NAT/防火墙穿越的连接</span>](#通过ice框架建立nat防火墙穿越的连接)
- [<span id="dataChannel">通过RTCDataChannel来传输任意数据</span>](#通过rtcdatachannel来传输任意数据)

<!-- /TOC -->

Web实时通信技术(Web Real-Time Communication)<br>
> 允许网络应用或者站点，在不借助中间媒介的情况下，建立浏览器之间点对点（Peer-to-Peer）的连接，实现视频流和（或）音频流或者其他任意数据的传输

1. WebRTC使用UDP协议传输信息, 但TURN服务器可以使用TCP来传输WebRTC信息
2. 使用[Adapter.js](https://github.com/webrtcHacks/adapter)，确保Web应用程序的兼容性
3. WebRTC创建连接时，顺序十分重要。如果没按照正确步骤会导致连接失败
4. WebRTC运行时，对于所有协议的实现都会强制执行加密功能，因此WebRTC处于DTLS上

参考资料<br>
> [博客|WebRTC介绍及简单应用](https://www.cnblogs.com/vipzhou/p/7994927.html)

## 重要名词
**信令信息(Signaling information)**
> 是指通信系统中的控制指令。用于指导终端、交换系统及传输系统协同运行，在指定的终端之间建立临时的通信信道，并维护网络本身正常运行。除了通信时的用户信息（包括话音信息和非话业务信息）以外的控制交换机动作的信号，就是信令信息

**STUN(Session Traversal Utilities for NAT)**
> NAT会话传输应用程序协议<br>
> 允许位于 NAT (或多重 NAT)后的客户端找出自己的公网地址，查出自己位于哪种类型的 NAT 之后以及NAT为某一个本地端口所绑定的 Internet 端端口。这些信息被用来在两个同时处于 NAT 路由器之后的主机之间建立 UDP 通信

**TURN服务器(Traversal Using Relays around NAT 服务器)**
> a protocol that allows for an element behind a NAT or firewall to receive incoming data over TCP or UDP connections<br>
> TURN服务器用于中间人转播消息，对双方透明

**ICE(Interactive Connectivity Establishment)**
> 交互式链接技术。允许实时对等端发现对方并且彼此连接的框架<br>
> [参考](https://webrtc.org.cn/three-things-about-ice/)

**NAT(Network Address Translation)**
> 网络地址转换，用于代理服务

**SDP(Session Description Protocol)**
> 会话描述协议，用于描述不同内容的会话并向系统提供标准API

**SCTP(Stream Control Translation Protocol)**
> 流传输控制协议。位于传输层安全协议（DTLS）上。设计用于解决TCP问题，同时利用UDP的传输能力，即提供基于不可靠传输业务的协议之上的可靠的数据报传输协议

**MCU(Multi Control Unit)**
> 多点控制单元。为了实现多点会议电视系统，必须设置MCU。MCU实质上是一台多媒体信息交换机，进行多点呼叫和连接，实现视频广播、视频选择、音频混合、数据广播等功能，完成各终端信号的汇接与切换<br>
> 参考：[三款基于WebRTC的MCU框架](#https://blog.csdn.net/xiaoluer/article/details/79088416)<br>
> [licode](#https://github.com/lynckia/licode) / [Kurento](#https://github.com/Kurento) / [jitsi](#https://github.com/jitsi)

## 建立媒体会话
### 建立WebRTC会话
1. 获取本地媒体
    + `MediaStream()`
2. *(可选)*建立信令通道，及对等链接
2. 在浏览器和对等终端建立链接
    + **意指不通过服务器，而是直接在两个终端之间建立链接。每一对浏览器都需要一个对等链接才能加入会议**
    + 建立此链接需要一个新的`RTCPeerConnection`对象
    + 在建立RTCPeerConnection实例之后，想要建立点对点的信道，需要做两件事: 
        * 确定本机上的媒体流的特性，如分辨率、编解码能力等（SDP描述符）[通过Offer/Answer交换](#changeSDP)
        * 连接两端的主机的网络地址（ICE Candidate）[使用ICE处理连接](#iceHandle)
3. 关联新媒体和数据通道至该链接
    + 每次更改媒体时，都需要在两个终端之间协商如何在链接通道中表示媒体
    + 使用`RTCSessionDescription`对象表示提议和应答
    + 相应的`RTCSessionDescription`对象存放会话描述和媒体表示，这样浏览器就可处理编解码器和编写SDP等复杂工作
4. 交换会话描述
    + 当终端交换完毕`RECSessionDescription`对象后，就可建立媒体会话
5. 交换多媒体流
    + 加入流非常容易，API会负责流的建立和发送。
    + 当另一方在对等连接中加入流时，会发送提醒，通知第一个用户有变更。
    + 浏览器使用`onaddstream`来通知用户流已加入
    + 使用`RTCDataChannel`来在两者之间建立一个双向数据通道的连接，[传输任意数据，而非仅仅是媒体流](#dataChannel)
6. 关闭链接
    + 任何一端都可以关闭链接。
    + 通过对`RTCPeerConnection`对象调用close()来关闭，用来停止ICE处理和媒体流传输

### <span id="changeSDP">通过offer和answer交换SDP描述符</span>
| 对象发起方（甲） | 对象接收方（乙）|
|:-:|:-:|
| **1**. 建立一个 PC (PeerConnection) 实例 | **1**. 建立一个 PC (PeerConnection) 实例 |
| **2**. 通过PC所提供的createOffer()方法建立一个包含SDP描述符的offer信令| **5**. 将甲的offer信令中所包含的的SDP描述符提取出来，通过PC所提供的setRemoteDescription()方法交给PC实例|
| **3**. 通过PC所提供的setLocalDescription()方法，将SDP描述符交给PC实例| **6**. 通过PC所提供的createAnswer()方法建立一个包含应答的SDP描述符answer信令|
| **4**. 将offer信令通过服务器发送给乙| **7**. 通过PC所提供的setLocalDescription()方法，将SDP描述符交给PC实例|
| | **8**. 将answer信令通过服务器发送给甲|
| **9**. 接收到乙的answer信令后，将其中乙的SDP描述符提取出来，调用setRemoteDescripttion()方法交给自己的PC实例| |
| **10**. 完成连接 | **10**. 完成连接 |

### <span id="iceHandle">通过ICE框架建立NAT/防火墙穿越的连接</span>
> WebRTC使用ICE框架来获得这个外界可以直接访问的地址，在创立PC的时候可以将ICE服务器的地址传递进去

1. 甲、乙各创建配置了ICE服务器的PC实例，并为其添加`onicecandidate`事件回调
2. 当网络候选可用时，将会调用`onicecandidate`函数
3. 在回调函数内部，甲或乙将网络候选的消息封装在ICE Candidate信令中，通过服务器中转，传递给对方
4. 甲或乙接收到对方通过服务器中转所发送过来ICE Candidate信令时，将其解析并获得网络候选，将其通过PC实例的`addIceCandidate()`方法加入到PC实例中

## <span id="dataChannel">通过RTCDataChannel来传输任意数据</span>
WebRTC会处理所有连接问题. 一旦信令完成连接建立, 则自动处理

> 为方便处理, dataChannel和多API和WebSocket近似, 但发送协议和路径完全不同

```js
var peerConn = new RTCPeerConnection();
var dataChannel = peerConn.createDataChannel("channelName", options);
dataChannel.onopen = (e)=>{}
dataChannel.onmessage = (e)=>{
    if(e.data instanceof Blob){};   //dataChannel 可以处理: String, Blob, ArrayBuffer, ArrayBufferView

    dataChannel.send(data); //发送数据
    dataChannel.close();    //关闭通道
};
dataChannel.onerror = (e)=>{};
dataChannel.onclose = (e)=>{};
```
