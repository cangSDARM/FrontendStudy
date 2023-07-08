<!-- TOC -->

- [废弃或提案](#废弃或提案)
  - [提案](#提案)
- [黑魔法](#黑魔法)
- [函数式编程](#函数式编程)
- [未分类](#未分类)

<!-- /TOC -->

- [数据处理模式](./DataFlow/README.md)
- [Graphics 相关](./graphics/README.md)
- [Network 相关](./network/README.md)
- [架构相关](./structure/README.md)
- [各种存储方案](./storages.md)
- [xPath](./xpath.md)
- [JWT](./JWT.md)
- [Renderer Patterns](./renderer.md)

[参考资料](https://dwqs.gitbooks.io/frontenddevhandbook/content/)

## 废弃或提案

> 这里放的是未归类的废弃或提案。有分类的应于对应条目查看

### 提案

- **WebHID** 通用输入设备逻辑接口(手柄等)
- **WebSerial** 串行设备 api(打印机/微控制器等)
- **WebNFC** Web NFC
- **WebTransport** 提案将允许在浏览器和服务器之间发送和接收数据，并在顶部使用常见 API 来实现其下的可插拔协议（尤其是基于 QUIC）。该 API 与 WebSocket 相似，也是客户端和服务器的双向连接，但允许进一步减少客户端和服务器之间的网络通信延迟，并且还支持多个流、单向流、乱序和不可靠传输。使用场景包括使用不可靠且乱序的消息向服务器重复发送低延迟的游戏状态、从服务器到客户端的媒体片段的低延迟传输以及大多数逻辑在服务器上运行的云场景。

## 黑魔法

- [异步构造函数](https://www.blackglory.me/async-constructor/)
- [自定义 URL 打开本地程序](https://www.lefer.cn/posts/12763/)
- 检测 Devtools 是否被打开
  - https://nocilol.me/archives/lab/check-browser-devtools-open/
  - https://weizman.github.io/page-js-anti-debug-2/
  - https://medium.com/@weizmangal/javascript-anti-debugging-some-next-level-sh-t-part-2-abusing-chromium-devtools-scope-pane-b2796c00331d

## 函数式编程

[高阶函数](https://segmentfault.com/a/1190000017569569)<br>
[柯里化](https://segmentfault.com/a/1190000006096034#articleHeader1)<br>
[Monad](https://github.com/cangSDARM/rust-scratch/blob/master/src/gof/state_monad.rs)

## 未分类

[中文开源字体](https://font.gentleflow.tech/)
[通过验证码(css:visited)检索你的浏览历史](https://varun.ch/history)
[网页性能相关的博客](https://calendar.perfplanet.com/)
[网页安全相关博客](https://blog.huli.tw/categories/)
[Node+Typescript 的 esm 依赖问题~解决方案: tsup~](https://juejin.cn/post/7117673524692516895)
