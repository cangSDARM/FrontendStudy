# React

<!-- TOC -->
- [使用脚手架搭建JS环境](#使用脚手架搭建js环境)
  - [虚拟DOM(Virtual Document Object Model)](#虚拟domvirtual-document-object-model)
  - [All in js](#all-in-js)
  - [Ajax](#ajax)
  - [React-Router](#react-router)
- [组件化编程](#组件化编程)
- [生命周期(outdate, based on 15.x)](#生命周期outdate-based-on-15x)
  - [Gatsby](#gatsby)

<!-- /TOC -->

****
**"响应式JS框架"**
## 使用脚手架搭建JS环境
+ 若使用`<script>`标签引入, 后期细化流程会减慢加载速度
+ 简化JS脚本的相互引用, 简化管理
+ 内置webpack, 不用自己麻烦打包压缩

> 1. npm install -g create-react-app
> 2. create-react-app app01 //新project
> 3. cd app01
> 4. npm run //热更新后台服务. 地址: localhost:3000
> 5. npm build //在`public`目录下构建生产环境用的一切静态资源、静态页面与js代码
> 6. 之后可以将除.map文件外丢到自己的空间

>#### 脚手架的通常环境目录
> 1. **`/node_modules`**: 自动安装项目所依赖的所有代码模块（npm软件包）的目录
> 2. **`/src`**: 将包含与所有前端内容相关的代码，例如网站标题或页面模板
> 3. **`/public`**: 包含manifest文件和html文件. 之后只用把这块上线即可
> 8. **`package-lock.json`**, **`package.json`**, **`yarn.lock`**: Gatsby自动生成, 连接npm用

### 虚拟DOM(Virtual Document Object Model) 
+ 将局部更新应用到JS层面，以实现DOM的更新优化
+ 用JS对象来模拟DOM树，数据影响虚拟DOM
+ 虚拟DOM前后对比, js和js比较
+ 之后根据虚拟DOM修改DOM, 用以DOM对比
+ 在React遍历节点时需要key, 便可以特定比较      
+ （类似于GC的逻辑)

### All in js
+ 可以在js中导入css: `import "/css.css"`, 但不推荐(这样导入的css是全局的, 需要在webpack中改)
+ JSX语法
+ 只要数据变化, 相应的页面也会变化

### Ajax
+ 得自己下插件: axios
+ Charles: 模拟映射. 仿造后端接口供前端测试

### React-Router
**Route可以写在任何位置**

+ hash路由(HashRouter): url中, 以 #/ 开头的字串
    - 添加hash路由时, 不需要加 #, 但要加 /
+ 内存路由(MemoryRouter): 不会反映在url中, 状态在内存中
+ 不会触发浏览器刷新操作, 但会给history中push一个url
+ 相关操作: window.onhashchange; window.location.hash
+ 核心组件:
    - `<Route [exact] path="" component={}>`未加exact是非排他的
    - `<Redirect to="">`重定向到
    - `<Switch>`只显示第一个匹配到的路由
    - `<Link to="">`链接
    - `<NavLink activeClassName="xx" >`会添加当前选中状态
    - `<Prompt when={} message="">`满足条件时提示用户是否离开当前页面
+ url参数:
    - `<Route path="/:id&:top">`定义
    - `this.props.match.params`获取
+ 和Redux一起使用url变化的时候, 如果要重新render, 必须要让组件绑定到router的store上
    - `router: state.router`

## 组件化编程
+ 组件分离: **将UI分解为可重用的部分**
+ 1.可变export组件
    + **组件名在page中自定义**
    + 在pages中:
        + `import 组件名 from "../components/ComponentsName.js"`
    + 在component中:
        + `export default () => <h1>This is a header.</h1>`
+ 2.不可变const组件
    + **组件名不可变**
    + 在pages中:
        + `import 组件名 from "../components/ComponentsName.js"`
    + 在component中:
        + `const Header = () => <h1>This is a header.</h1>`
        + `export default Header`

## 生命周期(outdate, based on 15.x)
+ `constructor`: 构造函数
+ `componentWillMount()`: 组件激活时调用
+ `render()`: 数据发生变化时调用
+ `componentDidMount()`: 组件激活成功时调用
+ **"DOM比较"**
+ `componentWillReceiveProps()`: 受父组件更新影响时调用
+ `shouldComponentUpdate(nextProps, nextState)`: 组件被更新之前调用. 返回true才更新
+ `componentWillUpdate()`: 组件更新时调用
+ `render()`: 组件渲染(必须存在)
+ `componentDidUpdate()`: 组件更新后调用
+ `componentWillUnmount()`: 组件失效时调用

### Gatsby
+ 用于搭建静态网页
