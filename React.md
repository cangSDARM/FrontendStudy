# React
****
## “响应式JS框架”
### 使用脚手架搭建JS环境
+ 若使用`<script>`标签引入, 后期细化流程会减慢加载速度
+ 简化JS脚本的相互引用, 简化管理
+ 常用脚手架: webpack/grunt/gulp
### **Gatsby**(需要node.js)
+ 用于快速搭建网页
+ 内置webpack开箱即用
>#### Gatsby初始化
> 1. npm install -g gatsby-cli
> 2. gatsby new ProjectName //新project
> 3. cd ProjectName
> 4. gatsby develop //热更新后台服务. 地址: localhost:8000
> 5. gatsby build //在`public`目录下构建生产环境用的一切静态资源、静态页面与js代码
> 6. 之后可以将除.map文件外丢到自己的空间
> 7. gatsby serve //启动静态网页服务器测试
>#### Gatsby环境目录
> 1. **`/node_modules`**: 自动安装项目所依赖的所有代码模块（npm软件包）的目录
> 2. **`/src`**: 将包含与所有前端内容相关的代码，例如网站标题或页面模板
> 3. **`/public`**: 包含manifest文件和html文件
> 4. **`gatsby-browser.js`**: Gatsby插件[Gatsby browser APIs](https://www.gatsbyjs.org/docs/browser-apis/)的接口
> 5. **`gatsby-config.js`**: 主要配置文件。可以在此处指定站点（元数据）的信息，例如站点标题和描述，Gatsby插件等。更多:[config docs](https://www.gatsbyjs.org/docs/gatsby-config/)
> 6. **`gatsby-node.js`**: Gatsby插件[Gatsby node APIs](https://www.gatsbyjs.org/docs/node-apis/)的接口
> 7. **`gatsby-ssr.js`**: Gatsby插件[Gatsby server-side rendering APIs](https://www.gatsbyjs.org/docs/ssr-apis/)的接口
> 8. **`package-lock.json`**, **`package.json`**, **`yarn.lock`**: Gatsby自动生成, 连接npm用
### 虚拟DOM(Virtual Document Object Model) 
+ 将局部更新应用到JS层面，以实现DOM的更新优化
+ 用JS对象来模拟DOM树，数据影响虚拟DOM
+ 虚拟DOM前后对比, js和js比较
+ 之后根据虚拟DOM修改DOM, 用以DOM对比
+ 在React遍历节点时需要key, 便可以特定比较      
+ （类似于GC的逻辑)
### All in js
+ 可以在js中导入css: `import "/css.css"`
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