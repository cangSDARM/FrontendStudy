- [Process](#process)
  - [spawn](#spawn)
- [Cluster](#cluster)
  - [进程守护](#进程守护)
  - [进程间通讯](#进程间通讯)
  - [负载均衡策略](#负载均衡策略)
- [Worker Threads](#worker-threads)

## Process

### spawn

```ts
const spawnProcess = (command: string, args: readonly string[]) => {
  const process = spawn(command, args, {
    shell: true,
    stdio: "inherit",
  });

  process.on("error", error);
  process.stderr?.on("error", error);

  return {
    process,
    awaitClose: async () =>
      new Promise<{ code: number | null; signal: NodeJS.Signals | null }>(
        (r) => {
          process.on("close", (code, signal) => r({ code, signal }));
        },
      ),
  };
};
```

## Cluster

是对 process 的封装。单机并发使用

- 支持两种连接处理方式：
  1. 由 master 监听并分发给 worker，拿到 worker 结果后在返回给请求端。master 用于代理分发
  2. master 监听后通知相关 worker，worker 直接连接到请求端进行交互(实际中由于系统调度等原因表现不佳，无法做到很好的负载)
- 实际上不支持粘性负载均衡(用户使用一个 worker 验证用户身份后，在负载均衡器中保留关系记录，以便后续同一个现场处理)
- 每一个工作进程都是独立的，并且互相之间除了能够进行通信外，没有办法共享内存

```js
const cluster = require("cluster");
const os = require("os");

// change the default 'fork' behavior。以便在 fork 时触发
cluster.setupPrimary({
  exec: __dirname + "/index.js",
});

if (cluster.isMaster) {
  const cpus = os.cpus().length;
  console.log("forking for ", cpus, " CPUS");
  for (let i = 0; i < cpus; i++) {
    // 当在主进程里执行 `cluster.fork` 之后，当前的文件将会被再次执行。
    // 不过这次是在 worker 模式执行的 isMaster/isPrimary 被设置为 false; isWorker 设置为 true
    // 底层通过注入给子进程 NODE_UNIQUE_ID 变量实现
    const worker = cluster.fork();
    console.log("forked worker pid", worker.process.pid);
  }
}
```

### 进程守护

```js
cluster.on("exit", (worker, code, signal) => {
  if (code !== 0 && !worker.exitedAfterDisconnect) {
    console.log(`worker ${worker.process.pid} has been killed`);
    console.log("Starting another worker");
    cluster.fork(); // 重新 fork 出来
  }
});
// or
worker.on("exit", () => {
  if (!worker.exitedAfterDisconnect) return;
  cluster.fork();
});
```

### 进程间通讯

```js
Object.values(clustur.workers).forEach((worker) => {
  worker.send("hello worker ", worker.id);
});

// worker.js
process.on("message", (msg) => {
  console.log(`Message from master:  ${msg}`);
});
```

### 负载均衡策略

只支持设置为 round-robin (从 1 开始，直到 N(worker 进程个数)，然后重新开始循环)，或者 none(系统决定)

```js
cluster.schedulingPolicy = cluster.SCHED_RR || cluster.SCHED_NONE;
```

## Worker Threads

是对 thread 的封装。用于 CPU 密集型任务

```js
const {
    Worker,
    isMainThread,
    parentPort
    workerData
} = require("worker_threads");

if (isMainThread) {
    const worker = new Worker(__filename, { workerData: "hello" });
    worker.on("message", msg => console.log(`Worker message received: ${msg}`));
    worker.on("error", err => console.error(error));
    worker.on("exit", code => console.log(`Worker exited with code ${code}.`));
} else {
    const data = workerData;
    parentPort.postMessage(`You said \"${data}\".`);
}
```
