# TODO

- [浏览器页面的原生生命周期](https://juejin.cn/post/6906779518040539144)
- [可迭代协议](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Iteration_protocols)
- [WebHID 通用输入设备逻辑接口(手柄等)](https://web.dev/hid/)
- [queryCommandSupported](https://github.com/microsoft/vscode/blob/ad91637f6a8ac84fcd8ac1b5449127c3460e828e/src/vs/editor/contrib/clipboard/clipboard.ts#L25)
- [Crypto](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [二元操作符](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Bitwise_Operators)
- [二维倾斜 Transform](https://developer.mozilla.org/zh-CN/docs/Web/CSS/transform-function/skew)
- [Shape](https://developer.mozilla.org/zh-CN/docs/Web/CSS/shape-outside)
- [Grid 布局](https://developer.mozilla.org/zh-CN/docs/Web/CSS/grid-auto-flow)
- [混合模式，mix-blend/background-blend/isolation/filter](https://developer.mozilla.org/zh-CN/docs/Web/CSS/mix-blend-mode)
- [片段模板，box-decoration-break](https://developer.mozilla.org/en-US/docs/Web/CSS/box-decoration-break)
- [Reflect 反射](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Reflect)
- [WebNFC](https://web.dev/nfc/)
- [WebSerial_api 串行设备 api(打印机/微控制器等)](https://wicg.github.io/serial/)
- [AOP, 面向切面编程](https://juejin.cn/post/6903484050095210509)
- [WebComponent](https://developer.mozilla.org/en-US/docs/Web/Web_Components)
- [webassembly](https://wasmbyexample.dev/home.en-us.html#)
- [webXR(vr+ar)](https://developer.mozilla.org/zh-CN/docs/Web/API/WebXR_Device_API)
- [webAudio](https://developer.mozilla.org/zh-TW/docs/Web/API/Web_Audio_API)
- [浏览器往返缓存(Back/Forward cache)](https://www.cnblogs.com/SyMind/p/8485332.html)
- [React18新API](https://thisweekinreact.com/articles/useSyncExternalStore-the-underrated-react-api)
- [安全博客](https://blog.huli.tw/)

****
temp

防止事件循环
- 当新值等于旧值时， trigger 方法不会导致触发 change 事件
- 模型正处于自身的 change 事件期间时，不会再触发 change 事件
- 如果在 trigger 方法中添加了{silent:true}选项，则不会触发 change 事件


// Deferred 对象是 Promise 的超集，可以手动触发
// 参考: https://github.com/shalldie/mini-dfd/blob/master/index.js
//      https://github.com/jquery/jquery/blob/main/src/deferred.js
var Deferred = $.get('/mydata');
Deferred.then(onSuccess);
Deferred.catch(onFailure);
Deferred.final(onAlways);

Deferred.resolve();
Deferred.reject();

Deferred.notify();  //通知步进数据
Deferred.progress();  //步进数据

// 异步工作流库 (简便处理限制并行，复杂依赖的函数链)
// https://github.com/caolan/async
// https://github.com/npm/slide-flow-control (带use case的实现demo)
