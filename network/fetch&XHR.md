[参考](https://segmentfault.com/a/1190000021367378)<br/>
[MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/Fetch_API/Using_Fetch)

|                  |                                        Fetch                                        |                   XMLHTMLRequest                   |
| :--------------: | :---------------------------------------------------------------------------------: | :------------------------------------------------: |
|   如何中断请求   | [AbortController](https://developer.mozilla.org/zh-CN/docs/Web/API/AbortController) |                      .abort()                      |
|   如何超时中断   |                           AbortController 配合 setTimeout                           | 1.timeout=500ms 自动中断<br/>2.ontimeout 事件回调  |
| 如何获取请求进度 |                        参考[下面的内容](###fetch-onprogess)                         | progress 事件有 total/lengthComputable/loaded 属性 |
|    怎么算失败    |                  仅当网络错误或请求被阻止 reject,否则都是 resolve                   |    出现任何非正常 200-300 的返回或网络请求错误     |
|     Cookies      |                          不会默认发送,否则设置 credentials                          |                      UNKNOWN                       |

### fetch onprogess

1. single stream

```js
const logProgress = (res) => {
    const total = res.headers.get('content-length');
    let loaded = 0;
    const reader = res.body.getReader();
    const stream = new ReadableStream({
        start(controller) {
            const push = () => {
                reader.read().then(({ value, done }) => {
                    if (done) {
                        controller.close();
                        return;
                    }
                    loaded += value.length;
                    if (total === null) {
                        console.log(`Downloaded ${loaded}`);
                    } else {
                        console.log(`Downloaded ${loaded} of ${total} (${(loaded / total * 100).toFixed(2)}%)`);
                    }
                    controller.enqueue(value);
                    push();
                });
            };
            push();
        }
    });
    return new Response(stream, { headers: res.headers });
};
fetch('/foo').then(logProgress).then(res => res.json()).then((data) => { ... });
```

2. multiple stream

```js
const logProgress = (res) => {
    const total = res.headers.get('content-length');
    let loaded = 0;
    const [progressStream, returnStream] = res.body.tee();  //split one stream to mutiple
    const reader = progressStream.getReader();
    const log = () => {
        reader.read().then(({ value, done }) => {
            if (done) return;
            // do progress program
            log();
        });
    };
    log();
    return new Response(returnStream, { headers: res.headers });
};
fetch('/foo').then(logProgress).then(res => res.json()).then((data) => { ... });
```

### 断点续传

1. 发起请求
2. 从响应头中拿到 Content-Length 属性
3. 在响应过程中拿到正在下载的数据
4. 终止下载
5. 重新下载，但是此时根据已经拿到的数据设置 Range 请求头
6. 重复步骤 3-5，直至下载完成
7. 下载完成，将已拿到的数据拼接成完整的
