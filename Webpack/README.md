# Webpack
***
## Webpack是从Node构建
## 从Webpack构建
1. 运行`npm init -y`初始化
2. 创建`src`和`dist`(类似于public)
3. 在src下创建`index.html`和`index.js`文件
4. `npm install webpack -D`
5. `npm install webpack-cli -D`
6. 在根目录创建`webpack.config.js`
7. 在控制台运行`webpack`
8. 在`index.js`中导入打包好的js文件
## Webpack热更新
1. `npm install webpack-dev-server -D`
2. 在`package.json`中新增: 
    + `"script":{ "dev": "webpack-dev-server --open" }`
    + `--open`自动打开浏览器
    + `--port 3000`重定向端口
    + `--host 127.0.0.1`重定向域名
    + `--progress`显示打包进度
    + `--compress`压缩
3. `npm run dev`
4. 将`index.js`导入的打包文件路径换为`/main.js`
    + 根目录中没有
    + Webpack托管于内存中
5. `npm install html-webpack-plugin -D`
    + 托管html文件在内存中
    + 删除磁盘上的`index.html`导入的js语句
## Webpack使用ES6语法
1. 安装`babel`插件
    + 运行`npm install babel-core babel-loder babel-plugin-transform-runtime -D`
    + 运行`npm install babel-preset-env babel-preset-stage-0 -D`
2. 安装babel的JSX解析块`npm install babel-preset-react -D`
3. 在`package.json`文件中配置:
    + `module: { rules: [ { test:/\.js|jsx$/, use: 'babel-loader', exclude: /node_modules/ } ]}`
4. 添加`.babelrc`配置文件
```javascript
{
    "presets": ["env", "stage-0", "react"],
    "plugins": ["transform-runtime"]
}
```