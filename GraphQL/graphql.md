# GraphQL

<!-- TOC -->

- [RESTful](#restful)
- [GraphQL](#graphql)
- [Express 实现](#express-实现)
- [Init](#init)

<!-- /TOC -->

> 这玩意儿自定义了一门语言, 有时间再浪费吧  
> **老老实实用 RESTful**

## RESTful

- `Representational State Transfer`表属性状态转移
- 定义 uri, 通过 api 来获取资源
- 在实现中, 即通常所说的 get
- 一个 url 接口返回一个资源
- 使用 url 来区分资源

```javascript
htmls://h5.ele.me/restapi/shopping/rest?latitude=31&longtitue=121
```

## GraphQL

- **必须要有 Query, Mutation 可以没有**
- 使用类型区分资源
- 查询使用 Query, 修改使用 Mutation
- 基本类型:
  - `String`
  - `Int`
  - `Float`
  - `Boolean`
  - `ID`
  - `[基本类型]`代表该类型数组
- 使用#注释 query
- [参考](http://graphql.cn/code/)

## Express 实现

- 使用中间件来拦截非法请求
- 使用 ConstrucingType 来解构 Schema, 便于维护

## Init

- npm i express graphql express-graphql
- nodemon main.js
- localhost:3000/graphql
