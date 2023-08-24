# React

<!-- TOC -->

- [使用脚手架搭建 JS 环境](#使用脚手架搭建-js-环境)
  - [虚拟 DOM(Virtual Document Object Model)](#虚拟-domvirtual-document-object-model)
  - [All in js](#all-in-js)
  - [React-Router](#react-router)
- [组件化编程](#组件化编程)
- [生命周期(outdate, based on 15.x)](#生命周期outdate-based-on-15x)

<!-- /TOC -->

---

**"响应式 JS 框架"**

## 使用脚手架搭建 JS 环境

- 若使用`<script>`标签引入, 后期细化流程会减慢加载速度
- 简化 JS 脚本的相互引用, 简化管理
- 内置 webpack, 不用自己麻烦打包压缩

> 1. npm install -g create-react-app
> 2. create-react-app app01 //新 project
> 3. cd app01
> 4. npm run //热更新后台服务. 地址: localhost:3000
> 5. npm build //在`public`目录下构建生产环境用的一切静态资源、静态页面与 js 代码
> 6. 之后可以将除.map 文件外丢到自己的空间

> #### 脚手架的通常环境目录
>
> 1. **`/node_modules`**: 自动安装项目所依赖的所有代码模块（npm 软件包）的目录
> 2. **`/src`**: 将包含与所有前端内容相关的代码，例如网站标题或页面模板
> 3. **`/public`**: 包含 manifest 文件和 html 文件. 之后只用把这块上线即可
> 4. **`package-lock.json`**, **`package.json`**, **`yarn.lock`**: Gatsby 自动生成, 连接 npm 用

### 虚拟 DOM(Virtual Document Object Model)

- 将局部更新应用到 JS 层面，以实现 DOM 的更新优化
- 用 JS 对象来模拟 DOM 树，数据影响虚拟 DOM
- 虚拟 DOM 前后对比, js 和 js 比较
- 之后根据虚拟 DOM 修改 DOM, 用以 DOM 对比
- 在 React 遍历节点时需要 key, 便可以特定比较
- （类似于 GC 的逻辑)

### All in js

- 可以在 js 中导入 css: `import "/css.css"`, 但不推荐(这样导入的 css 是全局的, 需要在 webpack 中改)
- JSX 语法
- 只要数据变化, 相应的页面也会变化

### React-Router

**Route 可以写在任何位置**

- hash 路由(HashRouter): url 中, 以 #/ 开头的字串
  - 添加 hash 路由时, 不需要加 #, 但要加 /
- 内存路由(MemoryRouter): 不会反映在 url 中, 状态在内存中
- 不会触发浏览器刷新操作, 但会给 history 中 push 一个 url
- 相关操作: window.onhashchange; window.location.hash

## 组件化编程

- 组件分离: **将 UI 分解为可重用的部分**
- 1.可变 export 组件
  - **组件名在 page 中自定义**
  - 在 pages 中:
    - `import 组件名 from "../components/ComponentsName.js"`
  - 在 component 中:
    - `export default () => <h1>This is a header.</h1>`
- 2.不可变 const 组件
  - **组件名不可变**
  - 在 pages 中:
    - `import 组件名 from "../components/ComponentsName.js"`
  - 在 component 中:
    - `const Header = () => <h1>This is a header.</h1>`
    - `export default Header`

## 生命周期(outdate, based on 15.x)

- `constructor`: 构造函数
- `componentWillMount()`: 组件激活时调用
- `render()`: 数据发生变化时调用
- `componentDidMount()`: 组件激活成功时调用
- **"DOM 比较"**
- `componentWillReceiveProps()`: 受父组件更新影响时调用
- `shouldComponentUpdate(nextProps, nextState)`: 组件被更新之前调用. 返回 true 才更新
- `componentWillUpdate()`: 组件更新时调用
- `render()`: 组件渲染(必须存在)
- `componentDidUpdate()`: 组件更新后调用
- `componentWillUnmount()`: 组件失效时调用
