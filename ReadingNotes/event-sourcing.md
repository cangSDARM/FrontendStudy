事件溯源(event-sourcing)
就是将视角从*维护state*变成**维护改变state的events**

## 名词解释

`events` 是用于改变state的，不是记录从程序函数流向的断点。每个节点需要有特定的改变才是 event
`aggregate` 是 events 处理的元对象。events 的靠它区分与连接，state 反映它的状态
`state` 从重放 events 得到
`snapshots` 是 events 的 checkpoints，是更短的 events
`projection` 是 特定event 的 对象到对象的映射，获取所需的特定数据

结构：用户操作 -> events -> 更短的 snapshots -> 更短的 snapshots -> 需要的 state -> 需要的 projection -> 反馈 UI

例子：react的flux架构, redux的单向数据流

## 优缺点

优点：

- 方便进行溯源与历史重现
- 使得实现在任何时间点确定实体状态的时间查询成为可能
- 业务逻辑由交换事件的松耦合业务实体组成。这使得从单体应用程序迁移到微服务架构变得容易得多
- 能提供非常好的性能。因为都是写新state，不存在更新state的可能，因此程序不存在锁的问题

缺点：

- 因为需要重放，events的结构不好改变
- 应用程序必须使用读写隔离(CQRS)来实现。这意味着必须处理读写事件流冲突时的复杂性
- 如果核心的aggregate id改变了，整套event-sourcing也需要改变
