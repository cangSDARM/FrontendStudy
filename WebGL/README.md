# WebGL
- WebGL内置于浏览器内, 基于`OpenGL ES 2.0`, 使用*GLSL ES*编写shader
- WebGL使用`<canvas></canvas>`元素绘制图形

## canvas
```js
function main(){
    var canvas = document.getElementById("canvas");
    if(!canvas){
        return;
    }
    var ctx = canvas.getContext("2d");
}
```

