# React
****
## “响应式JS框架”
### 使用脚手架搭建JS环境
+ 若使用`<script>`标签引入, 后期细化流程会减慢加载速度
+ 简化JS脚本的相互引用, 简化管理
+ 内置webpack, 不用自己麻烦打包压缩
### **Gatsby**(需要node.js)
+ 推荐不用(这玩意天天更新. 小心哪天给你重构了)
+ 用于快速搭建网页
>#### 初始化例子(React-create-app)
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
### Redux
+ Redux = Reducer + Flux
+ Store是唯一的, Store对外是封闭的(因此reducer是生成新对象)
+ React只是一个UI框架, Redux是数据层框架
+ 用以优化和存储组件数据
+ 开辟公共空间来存储数据, 组件受其数据影响并更新
+ Redux的中间件是影响dispatch方法
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