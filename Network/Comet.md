# Comet

> 利用长时间保留的 HTTP 请求（“挂起的 GET”）来让服务器向浏览器推送数据的技术，被称作 `Comet`<br/>
> 核心就在于永不超时，造成"服务器推送"的假象

基于 HTTP 长连接的"服务器推送"技术

https://www.ibm.com/developersworks/cn/web/wa-lo-comet

https://www.jianshu.com/p/88462e099347

```js
function checkUpdates(url) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url);
  xhr.onload = function() {   //处理更新并打开新的长轮询 XHR
    ...
    checkUpdates('/updates');   //发送长轮询请求并等待下次更新（如此不停循环）
  };
  xhr.send(); //发送第一次长轮询 XHR 请求
}

checkUpdates('/updates');
```
