- [Basic](#basic)
  - [采集](#采集)
  - [编解码](#编解码)
    - [压缩](#压缩)
    - [编码器](#编码器)
- [WebAudio](#webaudio)
  - [Basic](#basic-1)
  - [Advanced](#advanced)
    - [Intro: Modular](#intro-modular)
    - [Source Node](#source-node)
    - [Modification Node](#modification-node)

## Basic

### 采集

```txt
         次声波         可听声波          超声波
听觉范围  -------┴--------------------┴----------→ F(Hz, 振荡次数/每秒)
              20Hz                 2kHz
发声范围             └------------┘
                   85Hz       1100Hz
```

音频模拟信号三要素：音调(频率的快慢)、音量(频率的幅度)、音色(谐波)

要将一段音频模拟信号转换为数字信号，包含如下三个步骤：

1. Sampling(采样)
   - 定义声道数，按照声道数接受多声道的信号
   - 定义采样率(采样速率, Hz)，按照采样率采样
2. Quantization(量化)
   - 定义位深(采样可舍入大小, bit), 按照位深进行采样数据的舍入
3. Coding(编码)
   - 定义大小端，音频通常为小端存储

采集完后的即为 PCM(Pulse Code Modulation, 用数字表示的采样模拟信号) 流，
其`PCM 码率 = 位深 * 采样率 * 声道数`

或添加 WAV Header：

![WAV Header](/assets/wav-header.png)

### 编解码

#### 压缩

因为录制的音频 PCM 可能包含人类听觉范围外的声音，以及一些干扰声音(遮蔽)，
因此 PCM 大多数时候都需要经过有损压缩。

遮蔽包含

- 频域遮蔽
  - 一个强纯音会掩蔽在其附近同时发声的弱纯音，这种特性称为频域掩蔽
  - ![freq-masking](/assets/freq-masking.jpg)
- 时域遮蔽
  - 掩蔽效应发生在掩蔽声与被掩蔽声不同时出现时，又称异时掩蔽
  - 假设一个很响的声音后面紧跟着一个很弱的声音，而时间差在 200ms 之内，弱音就很难听到，相反在弱音后紧跟着一个很强的音，而时间在 50ms 之内，弱音也是很难听到
  - ![time-masking](/assets/time-masking.jpg)

#### 编码器

![encoders](/assets/audio-encoders.png)

![bitrate](/assets/audio-encoders-bitrate.png)

## WebAudio

### Basic

https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement

仅涉及如何加载音频、开始暂停、音量、速度、手动控制播放点

```jsx
const Audio = ({
  sources = [
    { src: "xx.mp3", type: "audio/mpeg" },
    { src: "yy.ogg", type: "audio/ogg" },
  ],
  fallbackMsg,
}) => {
  const audioRef = useRef(null);
  const duration = useState(0);
  const currentTime = useState(0);
  const progress = useState(0);

  useEffect(() => {
    if (!audioRef.current) {
      sources.forEach((s) => {
        const audioTester = document.createElement("audio");
        if (audioTester.canPlayType(s.type) == "probably") {
          // or "maybe" (until playback is actually attempted)
          audioRef.current = new Audio(s.src); // return a HTMLMediaElement
        }
      });
    }

    audioRef.current.addEventListener("loadedmetadata", (e) => {
      duration[1](e.target.duration);
    });
    audioRef.current.addEventListener("timeupdate", (e) => {
      let value = e.target.currentTime / audioRef.current.duration;
      progress[1](value * 100);
      currentTime[1](e.target.currentTime);
    });
  });

  return (
    <>
      <audio preload="metadata" ref={audioRef}>
        {/* 浏览器会使用第一个它支持的播放源 */}
        {sources.map((s) => (
          <source src={s.src} type={s.type} />
        ))}
        <p>{fallbackMsg || "Your browser doesn't support HTML5 audio"}</p>
      </audio>

      <div className="audio-container">
        <div
          onClick={(e) => {
            audioRef.current.play();
            audioRef.current.pause();
          }}
        >
          {audioRef.current.paused ? "暂停" : "播放"}
        </div>
        <div
          onClick={() => {
            audioRef.current.loop = true;
          }}
        >
          单曲循环
        </div>
        <div
          onClick={() => {
            audioRef.current.playbackRate = Math.random();
          }}
        >
          播放速度
        </div>
        <div
          onClick={() => {
            audioRef.current.volume = Math.random();
          }}
        >
          音量
        </div>
        <div className="audio-progress-box">
          {/* 拖动播放位置查看：https://juejin.cn/post/6936141251247308813 */}
          <span className="progressDot"></span>
          <div className="audio-progress-bar"></div>
        </div>
        <div className="audio-time">
          <span>{currentTime[0]}</span> / <span>{duration[0]}</span>
        </div>
      </div>
    </>
  );
};
```

### Advanced

#### Intro: Modular

WebAudio API 以模块形式组合(如调整音高以音高模块实现)，类似于现实的调音
![audio-modular-synth](../assets/audio-modular-synth.png)

模块大致上分为以下几种：

- Source nodes<br/>
  Sound sources such as audio buffers, live audio inputs, `<audio>` tags, oscillators, and JS processors
- Modification nodes<br/>
  Filters, convolvers, panners, JS processors, etc.
- Analysis nodes<br/>
  Analyzers and JS processors
- Destination nodes<br/>
  Audio outputs and offline processing buffers

各种模块以`AudioContext`连接和交互

```js
const context = new AudioContext();

// 模块都有一个connect方法
function connectNode(curNode, preNode, nextNode) {
  const prior = preNode || context.createBufferSource();
  const posterior = nextNode || context.destination;

  prior.connect(curNode);
  curNode.connect(posterior);
}
```

#### Source Node

```js
// 和Graphics的设计类似，需要一个context去操作Audio
const context = new AudioContext();
const sound = new ArrayBuffer(); // 音源以ArrayBuffer形式存在

// 加载音源数据
context.decodeAudioData(sound, (buf) => {});

function playSound(soundBuffer, time = 0) {
  var source = context.createBufferSource(); // creates a sound source
  source.buffer = soundBuffer; // tell the source which sound to play
  source.connect(context.destination); // connect the source to the context's destination (the speakers)
  source.noteOn(time); // play the source at the precise time
}
```

#### Modification Node

##### 音量(音高增益模块)

```js
var gainNode = new GainNode(context); // 通过 GainNode 实现
connect(gainNode); // 连接其它节点
gainNode.gain.setValueAtTime(volume, context.currentTime); // 调节增益值(音量)
```
