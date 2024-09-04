## XML-RPC

使用 XML 作为通信格式的 RPC 协议。

## SOAP

基于 XML 的通信协议，支持多种传输协议。

## gRPC

## JsonRPC

JsonRPC 协议定义了一种简单的 请求-响应 模型，通信双方通过发送和接收 JSON 格式的消息进行交互

当需要同时发送多个请求对象时，client 可以发送一个包含所有请求对象的数组。而 server 则需要返回一个包含相对应的响应对象数组。server 可以以任意顺序返回

### 请求

```json5
{
  // JsonRPC版本，通常为2.0
  jsonrpc: "2.0",
  // 调用的远程过程名
  // 以 rpc 开头的方法名预留作为系统扩展，且必须不能用于其他地方
  method: "methodName",
  // 可选。包含要传递给远程方法的参数列表
  // 必须是一个 object 或者 array
  params: { subtrahend: 23, minuend: 42 },
  // 请求的唯一标识符，用于将请求和响应进行匹配
  id: 1,
}
```

### 响应

```json5
{
  jsonrpc: "2.0",
  // 远程方法调用的结果值
  result: "resultValue",
  // 错误信息
  error: {
    code: 100,
    message: "errorMessage",
  },
  // 与请求中的标识符相匹配，用于将响应与请求进行匹配
  id: 1,
}
```

|       code       |           message           |                            meaning                            |
| :--------------: | :-------------------------: | :-----------------------------------------------------------: |
|      -32700      |  Parse error 语法解析错误   | 服务端接收到无效的 json。该错误发送于服务器尝试解析 json 文本 |
|      -32600      |  Invalid Request 无效请求   |              发送的 json 不是一个有效的请求对象               |
|      -32601      | Method not found 找不到方法 |                      该方法不存在或无效                       |
|      -32602      |  Invalid params 无效的参数  |                        无效的方法参数                         |
|      -32603      |   Internal error 内部错误   |                       JSON-RPC 内部错误                       |
| -32000 to -32099 |   Server error 服务端错误   |                  预留用于自定义的服务器错误                   |
