<!-- TOC -->

- [从 Webpack 构建](#从-webpack-构建)
- [Webpack 热更新](#webpack-热更新)
- [Webpack 使用 ES6 语法](#webpack-使用-es6-语法)
- [Webpack 省略文件扩展名](#webpack-省略文件扩展名)
- [Webpack 设置根目录](#webpack-设置根目录)
- [Webpack 样式表配置](#webpack-样式表配置)

<!-- /TOC -->

# Webpack

---

## 从 Webpack 构建

1. 运行`npm init -y`初始化
2. 创建`src`和`dist`(类似于 public)
3. 在 src 下创建`index.html`和`index.js`文件
4. `npm install webpack -D`
5. `npm install webpack-cli -D`
6. 在根目录创建`webpack.config.js`
7. 在控制台运行`webpack`
8. 在`index.js`中导入打包好的 js 文件

## Webpack 热更新

1. `npm install webpack-dev-server -D`
2. 在`package.json`中新增:
   - `"script":{ "dev": "webpack-dev-server --open" }`
   - `--open`自动打开浏览器
   - `--port 3000`重定向端口
   - `--host 127.0.0.1`重定向域名
   - `--progress`显示打包进度
   - `--compress`压缩
3. `npm run dev`
4. 将`index.js`导入的打包文件路径换为`/main.js`
   - 根目录中没有
   - Webpack 托管于内存中
5. `npm install html-webpack-plugin -D`
   - 托管 html 文件在内存中
   - 删除磁盘上的`index.html`导入的 js 语句

## Webpack 使用 ES6 语法

1. 安装`babel`插件
   - 运行`npm install babel-core babel-loder babel-plugin-transform-runtime -D`
   - 运行`npm install babel-preset-env babel-preset-stage-0 -D`
2. 安装 babel 的 JSX 解析块`npm install babel-preset-react -D`
3. 在`package.json`文件中配置:
   - `module: { rules: [ { test:/\.js|jsx$/, use: 'babel-loader', exclude: /node_modules/ } ]}`
4. 添加`.babelrc`配置文件

```javascript
{
    "presets": ["env", "stage-0", "react"],
    "plugins": ["transform-runtime"]
}
```

## Webpack 省略文件扩展名

1. 在`webpack.config.js`中添加:
   - `resolve: {extensions: ['.js', '.jsx', '.json']}`

## Webpack 设置根目录

**使得可以在 import 时, 路径写'@/components'. 即用符号表示 src 的这一层路径**

1. 在`webpack.config.js`中添加:
   - `resolve: {alias: {'@': path.join(__dirname, './src')} }`

## Webpack 样式表配置

**若不用这个, 则导入的所有 css 文件都是全局的**<br/>
**其它样式, 如 SCSS 和 LESS 相似. 只是后面需要加对应的 loader**<br/>
**只支持对`类选择器`和`Id选择器`生效, 不会对`标签选择器`生效**

1. 在`webpack.config.js`中添加:
   - `module:{rules: [{ test: /\.css%/, use:['style-loader', 'css-loader?modules&localIdentName=[loacl]-[hash:5]'] }] }`
   - `modules`表示对样式表启用模块化
   - `localIdentName`表示自定义生成的类名格式
     - [path] 表示**相对于根目录**所在路径
     - [name] 表示**样式表文件**名称
     - [local] 表示**样式定义的**名称
     - [hash:length] 表示**hash 值**(32 位 hash)
2. 使用:
   - `import CSS from 'xx.css'`
   - `<p className={CSS.类名} />`
