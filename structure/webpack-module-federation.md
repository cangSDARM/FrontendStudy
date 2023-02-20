## Webpack Module Federation

only work on Webpack^5

[intro/sample](https://www.youtube.com/watch?v=lKKsjpH09dU)

配置:

```ts
const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
const deps = require("./package.json").dependencies;

const plugins = [
  new ModuleFederationPlugin({
    // used for remotes
    name: "home",
    // 生成module federation的文件名
    filename: "remoteEntry.js",
    remotes: {
      // 导入时的名字: "name@打包位置/filename"
      home: "home@http://localhost:3000/remoteEntry.js", //可以指定自己
      pdp: "pdp@http://localhost:3001/remoteEntry.js",
    },
    exposes: {
      // 导出内容, 供其他在remote指定了该module的使用
      "./Header": "./src/Header.jsx",
      // 可以导出函数
      "./cart": "./src/cart.js",
    },
    shared: {
      // dependencies配置
      ...deps,
      react: {
        // webpack打包时会去检测运行环境确保其是唯一的
        singleton: true,
        requiredVersion: deps.react,
      },
      "react-dom": {
        singleton: true,
        requiredVersion: deps["react-dom"],
      },
    },
  }),
];
export default { plugins };
```

使用:

```ts
// import XX from 导入名/配置的导出路径
import Header from "home/Header";
// 也可以导入函数
import { listenCart } from "cart/cart";
// 可以调用其他View层的，例如在react里调用solid(因为底层把solid的也给打包进remoteEntry.js了)
// 但是只能调用最根部的框架相关的挂载整颗View逻辑的，直接调用相关组件是不可能的(因为这样webpack不会打包进相关框架)
import Hook from "solid/mount";

// 两边状态互通, 因为本质就是两边调用同一份文件的代码
listenCart((ev) => {
  console.log(ev);
});
```

#### TODO/问题

1. 和 ts 配合?
