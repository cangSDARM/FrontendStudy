- [SVG](./SVG.md)
- [Canvas](./Canvas/README.md)
- [WebGL](./WebGL/README.md)
  - [GIS](./GIS/README.md)
  - [Threejs](./Threejs/README.md)
- [WebGPU](./WebGPU/README.md)
- [光照](./lights.md)
- [杂项](./Trivia.md)

[动画 timing 函数的实现](https://zh.javascript.info/js-animation)

## 各种投影的实现

```js
import { mat4 } from "wgpu-matrix";

const fov = (60 * Math.PI) / 180; // 60 degrees in radians
const aspect = canvas.clientWidth / canvas.clientHeight;
const zNear = 1;
const zFar = 2000;
const projectionMatrix = mat4.perspective(fov, aspect, zNear, zFar);

const cameraPosition = [0, 0, 2];
const up = [0, 1, 0];
const target = [0, 0, 0];
const viewMatrix = mat4.lookAt(cameraPosition, target, up);
const viewProjectionMatrix = mat4.multiply(projectionMatrix, viewMatrix);
```
