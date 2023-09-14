## Basic

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
          audioRef.current = new Audio(s.src);  // return a HTMLMediaElement
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

## Advanced

### Intro: Modular

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

### Source Node

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

### Modification Node

#### 音量(音高增益模块)

```js
var gainNode = new GainNode(context); // 通过 GainNode 实现
connect(gainNode); // 连接其它节点
gainNode.gain.setValueAtTime(volume, context.currentTime); // 调节增益值(音量)
```
