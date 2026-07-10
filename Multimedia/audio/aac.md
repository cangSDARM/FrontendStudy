- [版本](#版本)
- [格式](#格式)

## 版本

目标是取代 MP3 格式

- 采样率选择：8kHz ~ 96kHz，MP3 为 16kHz ~ 48kHz
- AAC-LC 规定单帧长度为 1024，MP3 为 1152
  - AAC-LD, AAC-ELD 帧梗短
- 声道数上限：48 个，MP3 在 MPEG-1 模式下为最多双声道，MPEG-2 模式下 5.1 声道

最早是基于 MPEG-2 标准，称为：MPEG-2 AAC。后来 MPEG-4 标准在原来基础上增加了一些新技术，称为：MPEG-4 AAC

```txt
┌---AAC------------------┐
| ┌---------------┐      |
| |               |      |
| | AAC LC + SBR  | + PS |
| |               |      |
| └--AAC HEv1-----┘      |
|      AAC HEv2          |
└------------------------┘
```

- AAC LC(Low Complexity)
  - LC 码率在 96kbps ~ 192kbps 之间
- AAC HEv1(High Efficiency)
  - AAC LC + SBR
    - SBR(Spectral Band Replication, 频段复制)
    - 有损压缩
    - 核心思想是按照频谱分别编码保存。低频编码为主，高频单独放大编码保存音质
- AAC HEv2
  - AAC HEV1 + PS
    - PS(Parametric Stereo, 参数立体声)
    - 是一种有损的音频压缩算法，可以进一步提高压缩率
    - 存储一个声道的全部信息，然后花很少的字节用参数描述另一个声道和它不同的地方

在低码率的情况下，AAC HEv1，AAC HEv2 编码后的音质要明显好于 AAC LC。而在码率较大后(128kbps)，其主观质量逐渐相同

## 格式

- extradata
  - 在第一个头里，解码时先传输 extradata 信息，然后开始传输 raw data
  - 包含比特率、位深等信息
- ADIF
  - Audio Data Interchange Format
  - 只有一个头，其余后面都跟着 raw data
  - 仅能从开始处顺序一帧一帧解码，无法从中间位置解码
- ADTS
  - Audio Data Transport Stream
  - 每帧都带 7/9 字节头(9 字节包含 CRC 校验，但一般不做)
  - 方便跳播，从任何位置都可以直接进行解码
  - [含义解析](https://www.p23.nl/projects/aac-header/)
- LATM
  - Low-overhead MPEG-4 Audio TransportMultiplex
  - 每帧都带头，但传输时可以配置跳过头发送
