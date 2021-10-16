# 各种存储方式
**已被废弃的:** *Web SQL Database*<br>
**尚未完善的:** *CacheStorage*
<!-- TOC -->

- [Cookie](#cookie)
- [localStorage](#localstorage)
- [sessionStorage](#sessionstorage)
- [IndexedDB](#indexeddb)
    - [Redux](#redux)

<!-- /TOC -->
|Cookie|localStorage|sessionStorage|IndexedDB|redux|
|:-:|:-:|:-:|:-:|:-:|
|一般由服务器生成，可设置失效时间。如果在浏览器端生成Cookie，默认是关闭浏览器后失效|除非被清除，否则永久保存|仅在当前会话下有效，关闭页面后被清除|适合存储大量数据，其 API 是异步调用的。IndexedDB 使用索引存储数据，各种数据库操作放在事务中执行，且支持简单的数据类型。对于简单的数据，应该使用 localstorage。IndexedDB 能提供更为复杂的查询数据的方式|浏览网页过程中开辟的一块内存，刷新网页或者关闭网页，内存就会清除掉，用于整合散乱的组件数据|
|4K左右|一般为5MB|一般为5MB|任意大小|任意大小|
|每次都会携带在HTTP头中，如果使用cookie保存过多数据会带来性能问题|仅在客户端中保存，不参与和服务器的通信|仅在客户端中保存，不参与和服务器的通信|仅在客户端中保存，不参与和服务器的通信|仅在客户端中保存，不参与和服务器的通信|

## Cookie
更人性化的Cookie操作: [js-cookie包](https://www.npmjs.com/package/js-cookie)
```js
/*
使用 document.cookie 属性来创建, 读取, 及删除 cookie
*/
document.cookie = "name=Json; age=10";
document.cookie="username=John Doe; expires=Thu, 18 Dec 2043 12:00:00 GMT"; //expires设置过期时间
document.cookie="username=John Doe; expires=Thu, 18 Dec 2043 12:00:00 GMT; path=/"; //path指定cookie路径
document.cookie="username=John Smith; expires=Thu, 18 Dec 2043 12:00:00 GMT; path=/";   //修改即覆盖
document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 GMT";   //设置 expires 参数为以前的时间即可删除cookie
```

## localStorage
```js
/*
以键值对形式存储
操作只需要关心window.localStorage
可以使用JSON.stringify()和JSON.parse()来操作
*/
window.localStorage['a'] = 1
window.localStorage.getItem("key")      //增
window.localStorage.removeItem("key")   //删
window.localStorage.setItem("key", "value")     //改
window.localStorage.key(i)      //查
```

## sessionStorage
```js
/*
类似于localStorage, 但操作的对象是sessionStorage
*/
sessionStorage.setItem('key', 'value');
let data = sessionStorage.getItem('key');
sessionStorage.removeItem('key');
sessionStorage.clear();
```

## IndexedDB
<strong style="color: #afdc01">TODO</strong>

[对应的API](https://developer.mozilla.org/zh-CN/docs/Web/API/IndexedDB_API)<br/>
[简明教程](https://www.jianshu.com/p/ca838ff7e4d8)<br/>
#### Redux
+ Redux = Reducer + Flux
+ Store是唯一的, Store对外是封闭的(因此reducer是生成新对象)
+ React只是一个UI框架, Redux是数据层框架
+ 用以优化和存储组件数据
+ 开辟公共空间来存储数据, 组件受其数据影响并更新
+ Redux的中间件是影响dispatch方法
