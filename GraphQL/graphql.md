# GraphQL

> 这玩意儿自定义了一门语言, 有时间再浪费吧     
> **老老实实用RESTful**

## RESTful
+ `Representational State Transfer`表属性状态转移
+ 定义uri, 通过api来获取资源
+ 在实现中, 即通常所说的get
+ 一个url接口返回一个资源
+ 使用url来区分资源
```javascript
htmls://h5.ele.me/restapi/shopping/rest?latitude=31&longtitue=121
```
## GraphQL
+ **必须要有Query, Mutation可以没有**
+ 使用类型区分资源
+ 查询使用Query, 修改使用Mutation
+ 基本类型:
    - `String`
    - `Int`
    - `Float`
    - `Boolean`
    - `ID`
    - `[基本类型]`代表该类型数组
+ 使用#注释query
+ [参考](http://graphql.cn/code/)

## Init
+ npm i express graphql express-graphql
+ nodemon main.js
+ localhost:3000/graphql
