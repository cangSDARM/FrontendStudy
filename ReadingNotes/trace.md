## 关键指标

**可观测能力**是系统能否根据生成的外部数据(通常是日志、指标和跟踪)来研判系统内部运行情况的能力

M.E.L.T (指标 Metrix,事件 Event,日志 Log,跟踪 Traces)
日志、指标和跟踪构成了所有以事件驱动的远程监测的主要部分

- Event
- Logs
- Metrix: 对一段时间内活动的测量，以便了解系统的性能和潜在问题
- Traces: 是一种从头到尾跟踪流程(如，API 请求或其他系统活动)的行为，展示了服务之间的关联

## OpenTelemetry (OTel)

OTel 是一个开源可观测能力框架，由一系列工具、API 和 SDK 组成。
其目标是提高数据收集的系统无关性，规范远程遥测。
可以用来检测、生成、收集和导出数据，但是不做对应数据的存储和可视化设计

主要链路: App 发送遥测事件(Event)，经过多个服务/API(Span)，生成不同的全链路遥测信息

```txt
┌--------------------------------------------------┐
|                                                  |
| The App                                          |
|              ┌--------------------------------- OTel ------------------------------------------┐
|              |                                   |                                             |
|   Event ==> API => SDK => Processor => Exporter ==> Collector => Exporter => Telemetry Backend |
|              |                                   |                                             |
|              └-----------------------------------|---------------------------------------------┘
└--------------------------------------------------┘
```

- `Instrumentation`: 用于添加具体的观测能力
- `Resource`: 表示 APP 的具体信息
- `Tracer`: 在 App 中工作的对象，由 `TracerProvider` 创建
- `Span`: 最小遥测单元，包含了 name, timestamp, structured message, metadata 等，保证了追踪的有效性
- `Propagator`: 结构化工具，保证多个 Span 之间的逻辑链正确
  - 有不同传播器的定义，如 W3C Trace Context、Baggage 等
  - `Context`: 定义 traceparent 等数据
  - `Baggage`: 用于在 Span 之间传递键值对数据
  - `B3`: 主要用于 Zipkin
- `Exporter`: 用于收集和导出到可视化或存储中
- `Sampling`: 用于限制 App 生成传输的 Trace，防止遥测影响到性能
  - 头采样(Head-based coherent sampling): 在链路开头的 Span 就定义是否采样，之后全链路按照其设置进行采样
  - 尾采样(Tail-based coherent sampling): 在链路结尾的 Collector 定义是否采样，之后反馈给上游 Span 是否采样
  - 单元采样(Unitary sampling): 在链路某个 Span 自行决定，之后链路按照其设置进行(将其作为头的)头采样

### OpenTelemetry Protocol (OTLP)

规范描述了遥测数据在遥测源、收集器和后端之间的编码和传输机制
OTel SDK 会将事件转为 OTLP 数据
