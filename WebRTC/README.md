# WebRTC
Web实时通信技术(Web Real-Time Communication)

## 重要名词
**信令信息(Signaling information)**
> 是指通信系统中的控制指令。用于指导终端、交换系统及传输系统协同运行，在指定的终端之间建立临时的通信信道，并维护网络本身正常运行。信令系统是通信网的重要组成部分，是通信网的神经系统。 除了通信时的用户信息（包括话音信息和非话业务信息）以外的控制交换机动作的信号，就是信令信息

**ICE(Interactive Connectivity Establishment)**
> 交互式链接技术

**NAT(Network Address Translation)**
> 网络地址转换

**SDP(Session Description Protocol)**
> 会话描述协议

## 建立媒体会话
### 建立WebRTC会话
1. 获取本地媒体
    + `MediaStream()`
2. *(可选)*建立信令通道，及对等链接
2. 在浏览器和对等终端建立链接
    + 意指不通过服务器，而是直接在两个终端之间建立链接。每一对浏览器都需要一个对等链接才能加入会议。
    + 建立此链接需要一个新的`RTCPeerConnection`对象。该对象使用一个包含ICE和通过NAT的配置对象进行构建
3. 关联媒体和数据通道至该链接
    + 每次更改媒体时，都需要在两个终端之间协商如何在链接通道中表示媒体
    + 使用相应的`RTCSessionDescription`对象存放会话描述和媒体表示，这样浏览器就可处理编解码器和编写SDP等复杂工作
4. 交换会话描述
    + 当终端交换完毕`RECSessionDescription`对象后，就可建立媒体会话。交换之后的所有活动由JavaScript代码完成
5. 关闭链接
    + 任何一端都可以关闭链接。
    + 通过对`RTCPeerConnection`对象调用close()来关闭，用来停止ICE处理和媒体流传输