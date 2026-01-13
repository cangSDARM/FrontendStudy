- [RTP](#rtp)
  - [RTCP](#rtcp)
  - [RTSP](#rtsp)
- [RTMP](#rtmp)
- [HTTP-FLV](#http-flv)
- [HLS](#hls)
- [DASH](#dash)
- [WebRTC](#webrtc)
- [MSS](#mss)
- [SRT](#srt)

## RTP

Real-time Transport Protocol

基于 UDP 的传输层协议，以固定的数据率在网络上发送数据

通常 RTP 传输视频，RTCP 控制视频 QoS，RTSP 处理多端控制

### RTCP

Real-time Transport Control Protocol

传输层协议，控制 RTP 的。
和 IP/ICMP 协议关系差不多

### RTSP

Real-Time Stream Protocol

应用层协议，基于文本的有状态的 C/S 流媒体播放控制协议

一般情况 RTSP 本身并不用于转送媒体流数据，仅传输"远端控制"请求

浏览器不支持，一般用作摄像头、监控等硬件设备的实时视频流观看与推送

## RTMP

Real Time Messaging Protocol

为 Flash 播放器开发的应用层协议簇:

- RTMP
  - 工作在 TCP 之上
  - 默认使用端口 1935
- RTMPE
  - 增加了加密功能
- RTMPT
  - 封装在 HTTP 请求之上，可穿透防火墙
- RTMPS
  - 类似 RTMPT，增加了 TLS/SSL 的安全功能

但由于浏览器摒弃了 Flash，而且高并发下可能会出现不稳定的问题，
因此 RTMP 一般只用作直播系统内

工作模式一般为: 直播源 -|推流|-> RTMP 服务器 <-|拉流|- 转码 -|推流|-> 直播 CDN -> 其他协议(如 HTTP-FLV)

工作步骤:

1. 客户端与服务器建立 TCP 连接
2. 双方通过握手确认 RTMP 协议版本及交换随机数等信息
3. 客户端发送连接命令(connect)到服务器，服务器响应
4. 客户端与服务器建立流(stream)进行音视频数据传输
   - 一个连接内可以有多个流
   - 数据(Message)会划分成带有 Id 的 Chunk，便于传输和多路复用
5. 传输过程中，双方可以发送控制命令，如播放(play)、暂停(pause)等
6. 断开连接

![数据格式](/assets/rtmp-format.png)

## HTTP-FLV

即将音视频数据封装成 FLV，然后通过 HTTP 协议传输给客户端。
客户端像解析 FLV 格式一样去解析流，从而达到播放的目的

和文件下载不同的是，流的长度可能不确定长度，因此一般是基于`Transfer-Encoding: Chunked`实现。
和 HTTP-FLV 类似的，还有 HTTP-TS 或 HTTP-MP3。
TS 主要应用于广播电视领域，MP3 主要应用于音频领域

优点:

- 基于 HTTP，通常不会被防火墙拦截
- 可以自行定义扩展协议内容
- 基于 HTTP，支持转播、鉴权、CDN

## HLS

就是通过 HTTP 协议下载静态文件。
视频流直接写入磁盘，然后通过本地播放器控制

文件由两部分组成:

1. 记录这些视频文件地址的`.m3u8`索引文件
   - 支持根据清晰度的二级索引
   - 播放端完全依赖该文件进行播放(懒，但同时控制灵活)
2. 多个只有几秒长度的`.ts`视频文件

## DASH

是 HLS 标准化后的协议，因此工作原理类似

DASH 多用于 MPEG 格式，称为 MPEG-DASH

## [WebRTC](/network/WebRTC/README.md)

直接将流传递给 Web 的播放器，浏览器调度

缺点: 不支持 B 帧和 AAC 音频(用 ffmpeg.js 解决)

## MSS

## SRT
