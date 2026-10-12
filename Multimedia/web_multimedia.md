浏览器里处理多媒体数据主要有以下步骤:

1. 媒体源, HTMLVideoElement/navigator.mediaDevices/Audio
2. 媒体流, MediaStream/MediaStreamTrack
3. 媒体处理节点, AudioContext/WebCodec
4. 媒体导出节点, MediaRecorder/ffmpeg.wasm

为尽力实现要求，多媒体有以下规格参数:

1. Capabilities, 是浏览器或媒体硬件设备可以提供的某方面的能力，还会附带所支持的指标范围
2. Constraints, 是我们在请求媒体轨道时，指定所期望的能力及其指标，浏览器将尽可能满足这些约束
3. Settings, 是根据请求者所提供的 Constraints，最终获得的轨道的实际设置

## MediaDevices

用户摄像头/麦克风/录屏

> 如果从未在页面所在源通过 getUserMedia() 请求过音/视频的轨道，那么该类设备就不会被枚举

```js
// 1. 等待用户授权 resolve
const stream = await navigator.mediaDevices.getUserMedia({
  audio: true,
  video: true,
});
stream.getTracks().forEach((track) => track.stop());
// 订阅变更通知
navigator.mediaDevices.addEventListener("devicechange", async () => {});
// 判断当前正在采集的设备是否断开
stream.getTracks()[0].addEventListener("ended", () => {});

// 2. 枚举设备
const devices = await navigator.mediaDevices.enumerateDevices();
devices[3].groupId; // 用于标识物理设备。如果两个设备属于同一物理设备，它们会有相同的 groupId
devices[3].deviceId; // 唯一标识，但隐私考虑每次枚举都会变

// 3. 获取设备可用规格
devices[3].getCapabilities();

// 4. 连接指定设备
const stream = await navigator.mediaDevices.getUserMedia({
  audio: {
    deviceId: { exact: devices[3].deviceId }, // 必须使用这个设备，找不到直接抛错
  },
  video: {
    deviceId: { ideal: devices[3].deviceId }, // 优先尝试，找不到就自动回退到系统默认设备
  },
});
```

## MediaStream

来源

```js
// 1. 获取电脑摄像头 + 麦克风的 MediaStream
const stream = await navigator.mediaDevices.getUserMedia({
  video: true, // 开启摄像头
  audio: true, // 开启麦克风
});

// 2. 获取tab/显示器的 MediaStream
const stream = await navigator.mediaDevices.getDisplayMedia({
  monitorTypeSurfaces: "include", // 告诉浏览器：把显示器(整个屏幕)作为可选选项展示
});

// 3. 获取 `<video>` 元素的 MediaStream
const stream = videoEl.srcObject; // srcObj != null
const stream = videoEl.captureStream(); // src="xxx"

// 4. 获取 `<audio>` 元素的 MediaStream
const source = audioCtx.createMediaElementSource(audioEl);
const dest = audioCtx.createMediaStreamDestination();
source.connect(dest);
source.connect(audioCtx.destination);
const stream = dest.stream;

// 5. 获取 `canvas` 中的 MediaStream
const stream = canvas.captureStream(60 /* fps */);

// 6. 从程序化生成 track 获取 MediaStream
const generator = new MediaStreamTrackGenerator({ kind: "video" });
const stream = new MediaStream([generator]);
```

设置和 track 管理

```js
const track = stream.getTracks()[0];
stream.getAudioTracks();
stream.getVideoTracks();

stream.addTrack(track);
stream.removeTrack(track);

track.getCapabilities();
await track.applyConstraints({
  width: 1280,
  height: 720,
});
track.getConstraints();
track.getSettings();
track.clone();
track.enabled = true; // 可以随时启用/关闭轨道

// stream 停止后，需要关闭所有 track
stream.getTracks().forEach((t) => t.stop());
```

## MediaRecorder

只能使用浏览器内置编码器支持的 MIME。
如果使用没有内置编码器的私有格式，用 ffmpeg.wasm 转码；或 AudioWorklet + OffscreenCanvas 分别按帧处理

控制大小: 多个 MediaRecorder(文件) 分片录制

```js
let chunks = [];
const recorder = new MediaRecorder(stream, {
  mimeType: "video/webm;codecs=vp8,opus",
  videoBitsPerSecond: 1_000_000,
  audioBitsPerSecond: 64000,
});
recorder.addEventListener("dataavailable", (e) => {
  chunks.push(e.data);
});

recorder.addEventListener("stop", (e) => {
  const blob = new Blob(chunks, { type: recorder.mimeType });
  chunks = [];

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
});

recorder.start(timesliceMs); // 每隔 timesliceMs 产生一个新的分块
recorder.requestData(); // 手动提交分块
recorder.pause();
recorder.resume();
recorder.stop();
```
