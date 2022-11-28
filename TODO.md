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
- [Reflect 反射](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Reflect)
- [WebNFC](https://web.dev/nfc/)
- [WebSerial_api 串行设备 api(打印机/微控制器等)](https://wicg.github.io/serial/)
- [AOP, 面向切面编程](https://juejin.cn/post/6903484050095210509)
- [WebComponent](https://developer.mozilla.org/en-US/docs/Web/Web_Components)
- [webassembly](https://wasmbyexample.dev/home.en-us.html#)
- [webXR(vr+ar)](https://developer.mozilla.org/zh-CN/docs/Web/API/WebXR_Device_API)
- [webAudio](https://developer.mozilla.org/zh-TW/docs/Web/API/Web_Audio_API)
- [浏览器往返缓存(Back/Forward cache)](https://www.cnblogs.com/SyMind/p/8485332.html)
- [React18 新 API](https://thisweekinreact.com/articles/useSyncExternalStore-the-underrated-react-api)
- [安全博客](https://blog.huli.tw/)
- [前端程序构建系列](https://juejin.cn/post/6844903734460301325)

## Reading List

http://www.alloyteam.com/2020/05/14385/?comefrom=https://blogread.cn/news/

https://tech.meituan.com/2022/05/26/construction-and-evolution-of-software-component-analysis-capability.html?comefrom=https://blogread.cn/news/

https://insights.thoughtworks.cn/clean-architecture-css/?comefrom=https://blogread.cn/news/

https://insights.thoughtworks.cn/failure-driven-development/?comefrom=https://blogread.cn/news/

https://www.jonathan-petitcolas.com/2017/12/28/converting-image-to-ascii-art.html

https://juejin.cn/post/6844903792358473742

https://joaoforja.com/blog/guideline-on-how-to-decompose-a-react-component

https://www.zhangxinxu.com/wordpress/2021/08/file-system-access-api/

https://www.smashingmagazine.com/2021/08/react-children-iteration-methods/

https://css-tricks.com/fancy-image-decorations-single-element-magic/

https://css-tricks.com/how-to-make-a-folder-slit-effect-with-css/

https://css-tricks.com/the-difference-between-web-sockets-web-workers-and-service-workers/

https://teobler.com/posts/20220920-re-thinking-architecture-of-react-project?comefrom=https://blogread.cn/news/

https://insights.thoughtworks.cn/frontend-testing/?comefrom=https://blogread.cn/news/

https://insights.thoughtworks.cn/how-to-code-review/?comefrom=https://blogread.cn/news/

https://paper.seebug.org/2007/

https://blog.est.im/2022/stdout-11

https://blog.p2hp.com/archives/10054

---

temp

防止事件循环

- 当新值等于旧值时， trigger 方法不会导致触发 change 事件
- 模型正处于自身的 change 事件期间时，不会再触发 change 事件
- 如果在 trigger 方法中添加了{silent:true}选项，则不会触发 change 事件

// Deferred 对象是 Promise 的超集，可以手动触发
// 参考: https://github.com/shalldie/mini-dfd/blob/master/index.js
// https://github.com/jquery/jquery/blob/main/src/deferred.js
var Deferred = $.get('/mydata');
Deferred.then(onSuccess);
Deferred.catch(onFailure);
Deferred.final(onAlways);

Deferred.resolve();
Deferred.reject();

Deferred.notify(); //通知步进数据
Deferred.progress(); //步进数据

// 异步工作流库 (简便处理限制并行，复杂依赖的函数链)
// https://github.com/caolan/async
// https://github.com/npm/slide-flow-control (带 use case 的实现 demo)

为了统一网络传输时候的字节的顺序，TCP/IP 协议 RFC1700 里规定使用「大端」字节序作为网络字节序，所以，我们在开发网络通讯协议的时候操作 Buffer 都应该用大端序的 API，也就是 BE 结尾的
