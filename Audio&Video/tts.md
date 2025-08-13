## Web API

### 文字生成语音

```ts
const synth = window.speechSynthesis; // Controller
const voices = synth.getVoices(); //获取可用的语音
// 没有接口来自定义语音
const utter = new SpeechSynthesisUtterance(TexT); //加载文字
utter.voice = voices[0]; //设置语音
utter.pitch = 1.0; //音高
utter.rate = 1.0; //语速
utter.volume = 1.0; //音量

synth.speak(utter);
synth.pause();
synth.resume();

synth.addEventListener("voiceschanged", () => {});
```

### 语音转文字

> https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition
> 需要指定的语言语法(JSpeech Grammar Format)
