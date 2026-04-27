- Layer1: 效率
  - [内核 IO](./io.md)
- Layer2: 组织
  - [Promise, Generator, Async](./Promise_Async_Generator.md)
  - [Stream](./stream.md)
  - [Rxjs (Reactive Stream)](./Rxjs.md)
- Layer3: 可靠
  - [事件溯源模式](./event-sourcing.md)

C10K Problem: 线程是昂贵的，线程的限制导致了单台机器的线程上限。程序员/系统将时间花在管理线程上，而这些线程本可以用于做更有用的工作。
不同并发编程范式的解决方法:

|                       |              解决了              |                                又带来了                                |
| :-------------------: | :------------------------------: | :--------------------------------------------------------------------: |
|       Callback        | 每个连接线程的资源耗尽(后台调度) |            反向控制流，无法取消，错误难以收集处理，回调地狱            |
|    Promise/Future     |          嵌套、错误合并          |     一次性执行，类型轻度割裂(和同步的返回类型不同)，错误无声地消失     |
|      Async/Await      |          复合人机工程学          | 函数着色(污染)，生态系统碎片化(Rust 的 Tokio/async-std/smol)，顺序陷阱 |
| Channel(共享可变资源) |         不同步的内存访问         |                       新的竟态条件、新的死锁机制                       |
| Actor(隔离的消息通道) |        线程的竟态交互方式        |        性能压力迫使引入共享可变状态，某个线程崩溃导致的数据丢失        |

// 异步工作流库 (简便处理限制并行，复杂依赖的函数链)
// https://github.com/caolan/async
// https://github.com/npm/slide-flow-control (带 use case 的实现 demo)

防止事件循环

- 当新值等于旧值时， trigger 方法不会导致触发 change 事件
- 模型正处于自身的 change 事件期间时，不会再触发 change 事件
- 如果在 trigger 方法中添加了{silent:true}选项，则不会触发 change 事件

[Concurrency in JS](https://advancedweb.hu/how-to-use-async-functions-with-array-map-in-javascript/)
