- [Atomics](#atomics)
- [Semaphore](#semaphore)
- [Mutex](#mutex)

进程竟态:

- Starvation, 饥饿: 线程一直有机会跑，但每次抢锁都抢不过别人，永远拿不到锁
- Lost wakeup, 唤醒丢失: 唤醒信号是一次性事件，不持久保存。如果唤醒发生时线程还没进入 wait，这个通知就直接丢掉了，线程永远无法唤醒

## [Atomics](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Atomics)

包含两类

- 无等待原子操作，CPU 保证原子性: `Atomics.add` / `Atomics.and` / `Atomics.compareExchange` / `Atomics.load` / `Atomics.store`
- 阻塞等待原语(futex)，OS 保证调度: `Atomics.wait` / `Atomics.notify`

> 基于 `Atomics.wait` 也没法跨进程锁(SharedArrayBuffer 限制)，但可以在多线程内**真阻塞**(线程挂起让出 CPU)，但浏览器主线程是禁止阻塞的。<br/>
> 所以可以考虑用 Callback-Promise + `Atomics.waitAsync`

```diff
const typedArray = new Int8Array(workerData);
- typedArray[0] = raceData;
- console.dir({ raceData, value: typedArray[0] });
+ // Two Atomic Operation (store, load)
+ Atomics.store(typedArray, 0, raceData);
+ const value = Atomics.load(typedArray, 0);
+ console.dir({ raceData, value });
```

## Semaphore

信号量：一个计数器，用来限制同时访问某资源的线程数量

- `P 操作 / acquire`：计数减 1；减完为 0/负 则阻塞等待
- `V 操作 / release`：计数加 1；唤醒一个等待者
- 计数初始化为 N 即"最多 N 个并发"（N=1 时退化为互斥锁）

```js
class Semaphore {
  constructor(shared, offset) {
    this._count = new Int32Array(shared, offset, 1); // 只绑定视图，不做初始化
  }
  acquire() {
    while (true) {
      const count = Atomics.load(this._count, 0);
      if (
        count > 0 &&
        Atomics.compareExchange(this._count, 0, count, count - 1) === count
      )
        return;
      Atomics.wait(this._count, 0, count); // 挂起，直到 count 被其他线程改变
    }
  }
  release() {
    Atomics.add(this._count, 0, 1);
    Atomics.notify(this._count, 0, 1);
  }
}

// 只在主线程初始化一次，再传给 worker
// semaphore 初始计数 2
const shared = new SharedArrayBuffer(4);
Atomics.store(new Int32Array(shared, 0, 1), 0, 2);
// in worker
sem.acquire();
local++; // 受信号量约束的区域
sem.release();
```

## Mutex

互斥锁：特殊的信号量，同一时刻只允许一个线程进入临界区；与信号量的关键区别是**锁有归属**——必须由持有者释放，不能由其他线程"加 1"

分为两类锁:

1. **CAS 锁**: 只有 `compareExchange`，while 死循环重试，**没有 wait**，线程一直跑、占 CPU
2. **futex 锁**: 依赖内核 futex 机制；调用后线程进入内核阻塞，让出 CPU

```js
// 抢锁是非公平的，可能饿死；公平版见 fair semaphore（ticket 排队）
class Mutex {
  constructor(shared, offset) {
    this._lock = new Int32Array(shared, offset, 1); // 0: 未锁, 1: 已锁
  }
  acquire() {
    // 混合锁：自旋N次CAS，失败才wait
    let spin = 100;
    while (true) {
      if (Atomics.compareExchange(this._lock, 0, 0, 1) === 0) return; // 抢到锁
      if (spin-- <= 0) {
        Atomics.wait(this._lock, 0, 1); // 锁被持有，挂起
      }
    }
  }
  release() {
    // compareExchange 是"读-改-写"原子操作：值==1 时本身就写入 0，顺带校验持有权
    if (Atomics.compareExchange(this._lock, 0, 1, 0) !== 1) {
      throw new Error("Mutex is not locked");
    }
    Atomics.notify(this._lock, 0, 1);
  }
}

// 只在主线程初始化一次，再传给 worker
// mutex 初始未锁
const shared = new SharedArrayBuffer(4);
Atomics.store(new Int32Array(shared, 0, 1), 0, 0);
// in worker
mutex.acquire();
// 受互斥锁约束的区域
local += 0;
mutex.release();
```

三态版(glibc/futex 风格)：

只是性能有所优化。
增加"有等待者"状态后，无竞争时 `release` 零 notify(底层是 futex 系统调用)

```js
// 0: 未锁, 1: 已锁(无等待者), 2: 已锁(有等待者)
class Mutex {
  constructor(shared, offset) {
    this._lock = new Int32Array(shared, offset, 1);
  }
  acquire() {
    while (true) {
      const v = Atomics.compareExchange(this._lock, 0, 0, 1);
      if (v === 0) return; // 无竞争快路径
      if (v === 2 || Atomics.compareExchange(this._lock, 0, 1, 2) === 1) {
        Atomics.wait(this._lock, 0, 2); // 等"有等待者的锁定"状态解除
      }
    }
  }
  release() {
    if (Atomics.compareExchange(this._lock, 0, 1, 0) === 1) return; // 无等待者，直接解锁
    Atomics.store(this._lock, 0, 0);
    Atomics.notify(this._lock, 0); // 有等待者，全部唤醒竞争
  }
}
```
