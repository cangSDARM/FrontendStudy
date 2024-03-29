- [基础](#基础)
- [Tips](#tips)
  - [多显示器处理](#多显示器处理)
  - [动画](#动画)
  - [互动](#互动)
  - [预渲染](#预渲染)
  - [多缓冲(支持 webworker)](#多缓冲支持-webworker)
  - [获取局部图像数据并修改](#获取局部图像数据并修改)
  - [生成 Canvas 的快照](#生成-canvas-的快照)
- [样例](#样例)

## 基础

```ts
var canvas = document.querySelector("#canvas");

//检测是否支持canvas
if (canvas.getContext) {
  let ctx = canvas.getContext("2d"); //2d坐标原点基于Canvas的左上角. 但是原点位置可以修改
  //2d可以直接画: 矩形, 路径, 贝塞尔曲线, 文本, 图像, 阴影, 渐变, Bool合成
  // style 都可以设置 rgba/hex/gradient/pattern
  // 如果画出的线的点落在小数位置，会导致图形变得模糊(sub-pixel填充半透明颜色)
  // 如果一次绘制时有alpha重叠，canvas有自动的alpha混合
  // 有stoke效果的肯定有对应的fill

  // 画笔及画线效果
  const lineGrad = ctx.createLinearGradient(0, 0, 0, 150);
  lineGrad.addColorStop(0.25, "#fff");
  const ptrn = ctx.createPattern(Image, "repeat");
  ctx.strokeStyle = lineGrad; //描边画笔
  ctx.fillStyle = ptrn; //填充画笔
  ctx.lineCap = "butt"; //可以设置线的表现(线端、宽度、颜色、dash、拐弯效果等)
  ctx.shadowColor = "rgba(0,0,0,0.5)"; //可以设置阴影表现(Blur、Offset、Color等), 但在canvas中渲染阴影很低效
  ctx.globalCompositeOperation = "source-over"; //图像bool混合

  ctx.fillRect(x, y, width, hight); // draw immediately.
  ctx.clearRect(55, 55, 5, 5); // 清空该位置绘制的内容
  ctx.moveTo(10, 10); // 移动🖌️

  // 画复杂几何
  ctx.beginPath();
  ctx.moveTo(30, 30); // point, 实际上应该叫movePaintTo
  ctx.lineTo(20, 20); // line (connected point)
  ctx.closePath(); // 连接最后一个点和第一个点
  ctx.stroke(); // 填充线, 或者用 fill 填充封闭图形
  ctx.clip(); // 使用该path组成一个mask，之后的内容在path圈定范围内的才会画上去，如实现图像遮罩(用save/restore更改上下文or图层)

  const rect = new Path2D(); // Path对象, 方便管理Path, 而且可以用svg的path
  rect.arc(100, 35, 25, 0, 2 * Math.PI); // 也包含常规context画path的工具
  rect.addPath(new Path(), new DOMMatrix()); // 可以方便组合变形Path

  // 画字. Canvas中字体是bitmap，所以缩放会变模糊
  ctx.font = "20px Times New Roman";
  ctx.fillStyle = "Black";
  ctx.fillText("Sample String", 5, 30);
  const textMetrics = ctx.measureText("Text"); //获取文字在canvas上渲染后可能的信息(width,height,位置信息等)

  // 画图
  ctx.drawImage(imgCanvasVideo); //可以设置图片的拉伸(指定宽度、长度即可), 裁切(指定裁切位置和长宽)
  ctx.imageSmoothingEnabled = true; //图片拉伸时是否平滑

  // canvas上下文转换
  ctx.save(); //将现在canvas的设置压入栈中(用于保存: fillColor,globalAlpha,origin等)
  ctx.restore(); //从栈中弹出(不会改动canvas的显示内容, 只会改动对应的设置)

  // 变换
  ctx.translate(0, 0); //更改原点位置(可以看作添加了一个localSpace。之后就可以基于该原点绘制)
  ctx.rotate((Math.PI / 180) * degrees); //旋转座标(localSpace的座标)
  ctx.scaling(xS, yS); //可用于拉伸或镜像，如横座标镜像: scale(-1,1), 横座标拉伸2倍: scale(2,1)
  ctx.transform(cos, sin, -sin, cos, 0, 0); //对当前变换矩阵应用变换矩阵
  ctx.setTransform(-1, 0, 0, 1, 100, 100); //最终形态变换矩阵
  ctx.resetTransform(); // === ctx.setTransform(1, 0, 0, 1, 0, 0);

  window.context = ctx;
}
```

## Tips

### 多显示器处理

```ts
// 分辨率处理
function highres() {
  // Get the DPR and size of the canvas
  const dpr = window.devicePixelRatio;
  const rect = canvas.getBoundingClientRect();

  // Set the "actual" size of the canvas
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;

  // Scale the context to ensure correct drawing operations
  ctx.scale(dpr, dpr);

  // Set the "drawn" size of the canvas
  canvas.style.width = `${rect.width}px`;
  canvas.style.height = `${rect.height}px`;
}
// 处理dpr(图片模糊)
function dprSolve(ctx) {
  function useDevicePixelRatio() {
    const [dpr, setDpr] = useState(window.devicePixelRatio);
    useEffect(() => {
      const list = matchMedia(`(resolution: ${dpr}dppx)`);
      const update = () => setDpr(window.devicePixelRatio);
      list.addEventListener("change", update);
      return () => list.removeEventListener("change", update);
    }, [dpr]);
    return { dpr };
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0); // scale 前先恢复变换矩阵，不然会重复 scale
  ctx.scale(dpr, dpr);
}
```

### 动画

动画就是每次循环的时候 paint 改动到的内容

```ts
/* 注意：动画应该以相同的速度播放，无论用户帧率是多少

      帧率 =  1000 / delta

              像素           像素      delta     秒
    每帧速度 (-----) = 速度 (-----) x -------- (----)
              帧            秒        1000     帧

*/
function animation(canvas) {
  // 1. clean moving part. **Render screen differences only, not the whole new state**
  canvas.clearRect(0, 0, renderSize.w, renderSize.h);
  canvas.width = canvas.width; //清除整个 canvas
  canvas.clip();  // 使用 clip 裁剪 mask 也可以
  // 2. save previous state
  canvas.save();
  // 3. draw the animated contents
  draw();
  // 4. restore state
  canvas.restore();
  // 5. trigger next frame
  window.requestAnimationFrame(animation);
}

// 视差滚动
// 原理：保存状态、平移坐标系、绘制对应层次物体、恢复状态，继续下一层次。由远及近，从慢到快
function parallax(canvas) {
  canvas.save();
  canvas.translate(-BgOffset, 0);
  drawBg();
  canvas.restore();
  
  canvas.translate(-PlayerOffset, 0);
  canvas.translate(-UiOffset, 0);
  // ...
}
```

### 互动

并没有什么神奇 API，就是监听 event 并自己转换座标系

```ts
function interactive() {
  canvas.addEventListener("mouseenter", mouseEnter);
  canvas.addEventListener("mouseleave", mouseLeave);
  canvas.addEventListener("mousemove", mouseMove);
  canvas.addEventListener("mousedown", mouseDown);
  canvas.addEventListener("mouseup", mouseUp);
  canvas.addEventListener("keydown", keyDown);
  canvas.addEventListener("keyup", keyUp);
}

function winPos2Canvas(e) {
  const bbox = canvas.getBoundingClientRect();

  return {
    x: e.clientX - bbox.left * (canvas.width / bbox.width),
    y: e.clientY - bbox.top * (canvas.height / bbox.height),
  };
}
```

### 预渲染

当渲染操作成本高昂时, 可以将实时渲染的内容预先渲染好，然后仅复制渲染好的图片

```ts
function prerendering() {
  // 假设有个固定图片需要每帧渲染
  var m_canvas = document.createElement("canvas");
  m_canvas.width = 64;
  m_canvas.height = 64;
  var m_context = m_canvas.getContext("2d");
  drawMario(m_context);

  // 主canvas调用
  function render() {
    // 应预渲染图像尺寸和应用尺寸相似，否则图片拉伸性能有可能破坏优化效果
    context.drawImage(m_canvas, 0, 0, 64, 64);
    requestAnimationFrame(render);
  }
}
```

### 多缓冲(支持 webworker)

Canvas 元素内置双缓冲，每次渲染都使用自己的缓冲是有害的，但复杂场景多缓冲是有益的

> https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas

```ts
function offscreen(canvas) {
  // sample and unoptimized
  canvas.offscreenCanvas = document.createElement("canvas");
  canvas.offscreenCanvas.width = canvas.width;
  canvas.offscreenCanvas.height = canvas.height;
  canvas.getContext("2d").drawImage(canvas.offscreenCanvas, 0, 0);

  // sync, offscreenCanvas 做双缓冲, canvas 也可同步运算
  const screenCtx = canvas.getContext("bitmaprenderer");
  const offscreenSync = new OffscreenCanvas(canvas.width, canvas.height);
  screenCtx.transferFromImageBitmap(offscreenSync.transferToImageBitmap());

  // async, 把运算全部交给 offscreenCanvas, canvas 仅展示
  const offscreen = canvas.transferControlToOffscreen();
  const worker = new Worker("./canvas_worker.js");
  worker.postMessage({ offscreen }, [offscreen]);
  // in `canvas_worker.js`
  self.onmessage = (evt) => {
    const canvas = evt.data.offscreen;
    const render = () => requestAnimationFrame(render);
    requestAnimationFrame(render);
  };
}
```

### 获取局部图像数据并修改

```ts
function ImgData(ctx) {
  let imgData = ctx.getImageData(0, 0, 100, 100); //Location(x,y)+Size(x,y)
  // or just create one: ctx.createImageData(width, height)
  let data = imgData.data; //Uint8ClampedArray
  let row = 10,
    column = 10,
    pixelPos = row * (imgData.width * 4) + column * 4; // 要处理的图片pixel位置
  data[pixelPos] = data[pixelPos + 1]; // R通道 = G通道
  img.data = data;
  ctx.putImageData(imgData, 0, 0); //放回去
}
```

### 生成 Canvas 的快照

```ts
function Flash(canvas) {
  let imgURI = canvas.toDataURL("image/png");
  // or jpeg: canvas.toDataURL("image/jpeg", quality)
  // or blob: canvas.toBlob(_callBack, type, quality)

  let ima = document.createElement("img");
  ima.src = imgURI;
  document.body.appendChild(ima);
}
```

## 样例

- 从零实现并扩展可自由绘制的画板<br/>
  https://mp.weixin.qq.com/s?__biz=MzkxNTIwMzU5OQ==&mid=2247489862&idx=1&sn=11cdbdd9bbba595d4c6edd59ec3afcc7
