# 各种存储方式

**已被废弃的:** _Web SQL Database_

<!-- TOC -->

- [Cookie](#cookie)
- [localStorage](#localstorage)
- [sessionStorage](#sessionstorage)
- [IndexedDB](#indexeddb)
- [CacheStorage](#cachestorage)
- [Redux](#redux)

<!-- /TOC -->

|                                       Cookie                                        |              localStorage              |             sessionStorage             |                                                                                               IndexedDB                                                                                                |                             CacheStorage                             |                                           redux                                            |
| :---------------------------------------------------------------------------------: | :------------------------------------: | :------------------------------------: | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :------------------------------------------------------------------: | :----------------------------------------------------------------------------------------: |
| 一般由服务器生成，可设置失效时间。如果在浏览器端生成 Cookie，默认是关闭浏览器后失效 |        除非被清除，否则永久保存        |  仅在当前会话下有效，关闭页面后被清除  | 适合存储大量数据，其 API 是异步调用的。IndexedDB 使用索引存储数据，各种数据库操作放在事务中执行，且支持简单的数据类型。对于简单的数据，应该使用 localStorage。IndexedDB 能提供更为复杂的查询数据的方式 | 用于存储 Request/Response 对，提供了接口让开发者管理 http 缓存的机制 | 浏览网页过程中开辟的一块内存，刷新网页或者关闭网页，内存就会清除掉，用于整合散乱的组件数据 |
|                                       4K 左右                                       |               一般为 5MB               |               一般为 5MB               |                                                                                             80% disk space                                                                                             |                      一般为 50(Safari) - 100MB                       |                                          任意大小                                          |
|        每次都会携带在 HTTP 头中，如果使用 cookie 保存过多数据会带来性能问题         | 仅在客户端中保存，不参与和服务器的通信 | 仅在客户端中保存，不参与和服务器的通信 |                                                                                 仅在客户端中保存，不参与和服务器的通信                                                                                 |                仅在客户端中保存，不参与和服务器的通信                |                           仅在客户端中保存，不参与和服务器的通信                           |

## Cookie

更人性化的 Cookie 操作: [js-cookie 包](https://www.npmjs.com/package/js-cookie)

```js
/*
使用 document.cookie 属性来创建, 读取, 及删除 cookie
*/
document.cookie = "name=Json; age=10";
document.cookie = "username=John Doe; expires=Thu, 18 Dec 2043 12:00:00 GMT"; //expires设置过期时间
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

[对应的 API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)<br/>
[dexie](https://dexie.org/)<br/>
[rxdb](https://rxdb.info/)<br/>

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
