# RxJs

<!-- TOC -->
- [概述](#概述)
- [重试和错误处理](#重试和错误处理)
<!-- /TOC -->

Reactive Extensions, 一种函数式编程的实践库

## 概述

在 Rx 中, 一个 Observable 对象只有一种终结状态. 要么是完结(complete), 要么是出错(error).<br/>
一旦进入 error 状态, 这个 Observable 对象也就终结了, 不会再调用 next 或 complete 函数, 手动调用也不会生效. complete 状态同理

Rx 中,
`Cold Observable`指每次调用`.subscribe`方法都会重新生成所有历史数据;
`Hot Observable`指调用`.subscribe`方法仅利用之后产生的数据, 而不会收到以前的历史数据

Rx 中,
使用`.scan`来维护一个全局类型的数据

> 简单的示例

```js
// 定义事件发起者
const onSubscribe = (observer) => {
  let num = 1
  const handle = setInterval(() => {
    observer.next(num++)

    if (num > 3) {
      clearInterval(handle)
      observer.complete()
    }
  }, 1000)
}
// 创建可观察的事件
const observable = new Observable(onSubscribe)
// 事件的观察者
const observer = {
  next: (item) => console.log(item),
  complete: () => console.log('end'),
  error: () => console.log('err'),
}
// 发起和观察的关联
observable.subscribe(observer)
```

> 只记录 5s 内的网页元素的点击次数

```js
let clickCount = 0
const event = Rx.Observable.fromEvent(document.querySelector('#click'), 'click') //点击事件发起
const counterDown = Rx.Observable.timer(5000)
const filtered = event.takeUtil(counterDown) //只取 0-5s 内的数据

const showEnd = () => (document.querySelector('#end').innerText = 'end')
const updateCount = () => console.log(++clickCount)

counterDown.subscribe(showEnd) //5s后, 显示 'end'
filtered.subscribe(updateCount) //更新点击次数
```

> 鼠标拖拽元素的事件

```js
const box = document.querySelector('#box')
const mouseDown = Rx.Observable.fromEvent(box, 'mousedown')
const mouseUp = Rx.Observable.fromEvent(box, 'mouseup')
const mouseOut = Rx.Observable.fromEvent(box, 'mouseout')
const mouseMove = Rx.Observable.fromEvent(box, 'mousemove')

const drag = mouseDown.concatMap((startEvent) => {
  const initLeft = box.offsetLeft
  const initTop = box.offsetTop
  const stop = mouseUp.merge(mouseOut) // 鼠标移出或鼠标抬起

  //返回从 mouseDown 到 stop 间的 mouseMove
  return mouseMove.takeUtil(stop).map((moveEvent) => {
    return {
      x: moveEvent.x - startEvent.x + initLeft,
      y: moveEvent.y - startEvent.y + initTop,
    }
  })
})

drag.subscribe((pos) => console.log(pos))
```

## 重试和错误处理

```js
observable.retry(3) //让上游Observable重新跑一遍, 超过次数就继续
observable.catch((err) => Observable.of(8)).finally((x) => console.log(x)) //有错误后用一个默认值替代
```

Rx 的重试和错误处理只是**重新订阅了一次**上游数据而已

> 有延迟的重试及错误处理

```js
// 以指数级增长的延迟的有上限的重试
Observable.prototype.retryWithExpotentialDeley = function (
  maxRetry,
  initDelay = 10,
) {
  return this.retryWhen((err) => {
    return err
      .scan((errCount, err) => {
        if (errCount >= maxRetry) throw err
        return errCount + 1
      }, 0)
      .delayWhen((errCount) => {
        const delayTime = Math.pow(2, errCount - 1) * initDelay
        return Observable.timer(delayTime)
      })
  })
}
observable.retryWithExpotentialDeley(10, 10)
```
