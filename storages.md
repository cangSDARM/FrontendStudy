# 各种存储方式

**已被废弃的:** _Web SQL Database_

<!-- TOC -->

- [存储配额检查](#存储配额检查)
- [Cookie](#cookie)
- [localStorage](#localstorage)
- [sessionStorage](#sessionstorage)
- [IndexedDB](#indexeddb)
- [CacheStorage](#cachestorage)
- [Redux](#redux)
- [File Access System](#file-access-system)
  - [UPFS](#upfs)
  - [OPFS](#opfs)
  - [In-Memory](#in-memory)
- [NoSQL](#nosql)

<!-- /TOC -->

|                                       Cookie                                        |                          localStorage                          |                       sessionStorage                        |                                                                                               IndexedDB                                                                                                |                                             CacheStorage                                              |                                           redux                                            |
| :---------------------------------------------------------------------------------: | :------------------------------------------------------------: | :---------------------------------------------------------: | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------------: | :----------------------------------------------------------------------------------------: |
| 一般由服务器生成，可设置失效时间。如果在浏览器端生成 Cookie，默认是关闭浏览器后失效 | 除非被清除，否则永久保存。在同源的所有标签页和窗口之间共享数据 | 仅在当前会话页签中有效(包括同源的 iframe)，关闭页面后被清除 | 适合存储大量数据，其 API 是异步调用的。IndexedDB 使用索引存储数据，各种数据库操作放在事务中执行，且支持简单的数据类型。对于简单的数据，应该使用 localStorage。IndexedDB 能提供更为复杂的查询数据的方式 | 用于存储 Request/Response 对，提供了接口让开发者管理 http 缓存的机制，一般为永久保存(Safari 是 14 天) | 浏览网页过程中开辟的一块内存，刷新网页或者关闭网页，内存就会清除掉，用于整合散乱的组件数据 |
|                                       4K 左右                                       |                           一般为 5MB                           |                         一般为 5MB                          |                                                                                             80% disk space                                                                                             |                                       一般为 50(Safari) - 100MB                                       |                                          任意大小                                          |
|        每次都会携带在 HTTP 头中，如果使用 cookie 保存过多数据会带来性能问题         |             仅在客户端中保存，不参与和服务器的通信             |           仅在客户端中保存，不参与和服务器的通信            |                                                                                 仅在客户端中保存，不参与和服务器的通信                                                                                 |                                仅在客户端中保存，不参与和服务器的通信                                 |                           仅在客户端中保存，不参与和服务器的通信                           |

## 存储配额检查

```ts
navigator.storage.estimate().then((estimate) => {
  console.log(
    `总存储配额：${(estimate.quota / (1024 * 1024)).toFixed(2)} MB,`,
    `已使用总存储：${(estimate.usage / (1024 * 1024)).toFixed(2)} MB,`,
    Object.keys(estimate.usageDetails)
      .map((detail) => {
        return `${detail} 已使用：${(estimate.usageDetails[detail] / (1024 * 1024)).toFixed(2)} MB`;
      })
      .join(","),
  );
});
```

## Cookie

更人性化的 Cookie 操作: [js-cookie 包](https://www.npmjs.com/package/js-cookie)

```js
/*
使用 document.cookie 属性来创建, 读取, 及删除 cookie
*/
document.cookie = "name=Json; age=10";
document.cookie =
  "username=John Doe; expires=Thu, 18 Dec 2043 12:00:00 GMT; max-age=3000"; //设置过期时间
document.cookie =
  "username=John Doe; expires=Thu, 18 Dec 2043 12:00:00 GMT; path=/"; //path指定cookie路径
document.cookie =
  "username=John Smith; expires=Thu, 18 Dec 2043 12:00:00 GMT; path=/"; //修改即覆盖
document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 GMT"; //设置 expires 参数为以前的时间即可删除cookie
```

## localStorage

```js
/*
以键值对形式存储
操作只需要关心window.localStorage
可以使用JSON.stringify()和JSON.parse()来操作
*/
window.localStorage["a"] = 1;
window.localStorage.getItem("key"); //增
window.localStorage.removeItem("key"); //删
window.localStorage.setItem("key", "value"); //改
window.localStorage.key(i); //查

// 当 localStorage 或 sessionStorage 中的数据更新后，storage 事件就会触发
// 该事件会在所有可访问到存储对象的 window 对象上触发，导致当前数据改变的 window 对象除外
window.onstorage = ({ key, newValue, oldValue, url, storageArea }) => {};
```

## sessionStorage

```js
/*
API和localStorage一致, 但操作的对象是sessionStorage
*/
sessionStorage.setItem("key", "value");
let data = sessionStorage.getItem("key");
sessionStorage.removeItem("key");
sessionStorage.clear();
```

## IndexedDB

may should try to use library. native one is not so friendly

[简要说明](https://zh.javascript.info/indexeddb)<br/>
[localForge](https://github.com/localForage/localForage)<br/>
[idb](https://github.com/jakearchibald/idb)<br/>

每次打开之前，就必须确定表名(storeName), 再打开(openStore)

## CacheStorage

CacheStorage 由于是开发者自己管理，所以没有被主动请求/删除的，都会被保存——除非是到了浏览器的 hard limit。因此开发者应该定期检查处理

CacheStorage 不保证 header/cookie 的正确，它只保存数据对象

```js
const hasObj = await caches.has("demo-cache");  //检查缓存对象
const cacheObj = await caches.open("demo-cache"); //打开一个缓存对象
// 增/改
await cacheObj.add("/subscribe"); //add添加对象，浏览器即刻获取(通过fetch)
await cacheObj.add(new Request("/subscribe", { headers: new Headers() })); //也可以是一个Request对象
await cacheObj.addAll([]); //接受数组
await cacheObj.put(reqOrUrl, resp); //更底层的方式。add和addAll都不支持非200的req，put支持
// 查
await cacheObj.matchAll(reqOrUrl, Opt?); //url 返回cache中查找url字符串满足的所有
await cacheObj.match(reqOrUrl, Opt?); // matchAll[0] 的简写
await cacheObj.keys(reqOrUrl?, Opt?); // 返回所有的Request对象
// 删
const deleted = await cacheObj.delete(reqOrUrl, Opt?);
// 删除缓存对象
caches.delete(cacheObj);
```

## Redux

- Redux = Reducer + Flux
- Store 是唯一的, Store 对外是封闭的(因此 reducer 是生成新对象)
- React 只是一个 UI 框架, Redux 是数据层框架
- 用以优化和存储组件数据
- 开辟公共空间来存储数据, 组件受其数据影响并更新
- Redux 的中间件是影响 dispatch 方法

## File Access System

文件访问分为两种：

1. 用户选择的文件 UPFS(User Picked File System)
   - 速度慢，用户可见
2. OPFS(Origin Private File System)
   - 速度快，用户不可见(是浏览器持久化的一种)

通用文件读写

```ts
const fileHandle: FileSystemFileHandle;
const directoryHandle: FileSystemDirectoryHandle;

// 存在性检查
fileHandle !== null;

// 删除
await fileHandle.remove();
await directoryHandle.removeEntry("file", { recursive: true });
// 列出目录
for await (let [name, handle] of directoryHandle.entries()) {
}
// 读取文件
const file: File = fileHandle.getFile();
const reader = new FileReader();
reader.onload = () => {};
reader.onerror = console.error;
reader.readAsText(file);
reader.readAsArrayBuffer(file);
// 写入文件
const writableStream = await fileHandle.createWritable();
await writableStream.write({
  data: new ArrayBuffer(),
  type: "write",
  position: 10,
  size: 10,
});
await writableStream.close();
```

### UPFS

```ts
// 读取用户提交的
const [fileHandle]: FileSystemFileHandle[] = await window.showOpenFilePicker({
  types: [{ accept: { "image/png": [".png"] } }],
});
const dirHandle: FileSystemDirectoryHandle = await window.showDirectoryPicker();
document.querySelector("div").addEventListener("drop", (e) => {
  for (const item of e.dataTransfer.items) {
    if (item.kind === "file") {
      const entry = await item.getAsFileSystemHandle();
      const isDir = entry.kind === "directory";
    }
  }
});
document.querySelector('input[type="file"]').addEventListener("change", (e) => {
  for (const item of e.target.files) {
    const entry: File = item;
  }
});

// 要求授权
if ((await fileHandle.queryPermission(opts)) !== "granted") {
  await fileHandle.requestPermission(opts);
}

// 写入用户想写的
const saveHandle: FileSystemFileHandle = await window.showSaveFilePicker({
  suggestedName: "Changed",
});
```

### OPFS

是对用户不可见的、底层的逐字节文件访问能力。
因此它不需要 UPFS 相同的安全性检查和授权，速度更快(会直接落盘)

may should try to use library. native one is not so friendly (most times need operating PATH)

[opfs-worker](https://github.com/kachurun/opfs-worker)<br/>

```ts
// 需要获取 root 路径，其他的文件访问都是通过 root 访问
const opfsRoot: FileSystemDirectoryHandle = navigator.storage.getDirectory();

const fileHandle: FileSystemFileHandle = await opfsRoot.getFileHandle("file", {
  // 不存在时创建
  create: true,
});
// 子目录需要先访问父目录的 handle
const directoryHandle: FileSystemDirectoryHandle =
  await opfsRoot.getDirectoryHandle("folder");
```

OPFS 在 worker 中使用才能达到最佳

```ts
const syncAccessHandle: FileSystemSyncAccessHandle =
  await fileHandle.createSyncAccessHandle();
syncAccessHandle.getSize();
syncAccessHandle.read(new ArrayBuffer(10), { at: 10 });
syncAccessHandle.write(new ArrayBuffer(10), { at: 10 });
syncAccessHandle.truncate(); //将文件调整至给定的大小
syncAccessHandle.flush();
syncAccessHandle.close();
```

### In-Memory

- https://github.com/streamich/memfs
- https://github.com/zen-fs/core

## NoSQL

- https://github.com/sqlite/sqlite-wasm
- https://github.com/pubkey/rxdb
