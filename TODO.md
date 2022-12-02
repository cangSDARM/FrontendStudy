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

http://www.alloyteam.com/2020/05/14385/

https://insights.thoughtworks.cn/clean-architecture-css/

https://www.jonathan-petitcolas.com/2017/12/28/converting-image-to-ascii-art.html

https://juejin.cn/post/6844903792358473742

https://css-tricks.com/fancy-image-decorations-single-element-magic/

https://blog.est.im/2022/stdout-11

https://github.com/aliyun-node/Node.js-Troubleshooting-Guide/blob/master/0x01_%E9%A2%84%E5%A4%87%E7%AF%87_%E5%B8%B8%E8%A7%84%E6%8E%92%E6%9F%A5%E7%9A%84%E6%8C%87%E6%A0%87.md

https://deno.com/blog/the-future-of-web-is-on-the-edge

https://quic.xargs.org/

https://juejin.cn/post/7022637452066029599

https://cp-algorithms.com/graph/strongly-connected-components.html

https://zhuanlan.zhihu.com/p/468185946

https://zhuanlan.zhihu.com/p/50712698

https://sidbala.com/h-264-is-magic/

https://www.smashingmagazine.com/2022/06/precise-timing-web-animations-api/

https://greenteapress.com/thinkdsp/html/thinkdsp002.html

https://dev.to/masakudamatsu/favicon-nightmare-how-to-maintain-sanity-3al7

https://fusionauth.io/learn/expert-advice/oauth/modern-guide-to-oauth

https://www.figma.com/blog/how-figmas-multiplayer-technology-works/

https://joel.is-a.dev/2022-01-06--find-the-shortest-palindrome-an-intensive-review-of-kmp(knuth-morris-pratt)-algorithm/

https://charliegerard.dev/blog/ultrasonic-payments/

https://secretgeek.github.io/html_wysiwyg/html.html

https://abstractkitchen.com/blog/a-short-guide-to-chinese-coordinate-system/

https://httptoolkit.com/blog/cache-your-cors/

https://www.jianshu.com/p/a7b900e8e50a

https://zhuanlan.zhihu.com/p/484991482

https://lcamtuf.coredump.cx/photo_basics/

https://www.wired.com/story/mars-hiberators-guide-to-the-galaxy/

https://two-wrongs.com/statistical-process-control-a-practitioners-guide

https://github.com/jlevy/the-art-of-command-line/blob/master/README-zh.md

https://busy-beavers.tigyog.app/rice

https://github.com/steadylearner/Rust-Full-Stack/blob/master/blog/posts/Rust/How%20to%20use%20React%20with%20Rust%20Actix.md

https://notes.normally.com/cookieless-unique-visitor-counts/

https://zed.dev/blog/crdts

https://www.programiz.com/dsa/radix-sort

https://www.youtube.com/watch?v=2y3IK1l6PI4

https://www.youtube.com/watch?v=ynNDmp7hBdo

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
