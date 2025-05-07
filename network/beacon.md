Beacon 非阻塞、不需要考虑返回的内容

通常在 unload 时发送。其他在 unload 事件处理器中产生的 XMLHttpRequest 通常会被忽略

发送 POST 请求

```ts
// unload 和 beforeunload 通常不可靠
document.addEventListener("visibilitychange", function logData() {
  if (document.visibilityState === "hidden") {
    navigator.sendBeacon("/log", analyticsData);
  }
});
```
