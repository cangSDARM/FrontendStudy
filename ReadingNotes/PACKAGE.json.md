# About `package.json`

[Ref](https://2ality.com/)

```json
{
  "main": "./dist/src/main.js",
  "exports": {
    "./*": "./dist/src/*",
    "./lib/*": "./dist/src/lib/*.js",
    "./rexpo/*": "./dist/src/utils/third/*",
    "./internal/*": null,
    "./impreq/*": {
      "import": "./dist/src/main.module.js",
      "require": "./dist/src/main.require.js"
    }
  },
  "typeVersions": {
    "*": {
      "main.d.ts": ["dist/src/main.d.ts"]
    }
  },
  "workspaces": ["xyz", "abc"],
  "dependencies": {
    "xx": "file:../xx"
  }
}
```

- "main": 向后兼容, no features.
- "exports": 用于 <br/>
  1. 缩短导入时的说明符:
     - "./\*": `import {Internal} from 'my-pack/util/errors.js'`
     - 没有: `import {Internal} from 'my-pack/dist/src/util/errors.js'`
  2. 隐藏不需要外部访问的内容:
     - "./internal/\*": 外部导入则报错
     - 没有: 外部可以随意访问
  3. 导入时无需扩展名:
     - "./lib/\*": `import {Lib} from 'my-pack/lib/main'`
     - 没有: `import {Lib} from 'my-pack/lib/main.js'`
  4. 重导出:
     - "./rexpo/\*": `import {Rexpo} from 'my-pack/rexpo/main'`
     - 没有: `import {Rexpo} from 'my-pack/utils/third/main'`
  5. import/require 重定向:
     - "./impreq/\*": import 和 export 导入的内容可以不同
     - 没有: import 和 export 导入内容一样，并由于 ESM/CommonJS 的逻辑不同，有可能出 BUG
- "typeVersions": 与 exports 作用相似, 但是用于 ts 的类型导入
- ["workspaces"](https://docs.npmjs.com/cli/v7/using-npm/workspaces#running-commands-in-the-context-of-workspaces): npm 的 monorepo 支持，允许<br/>
  - 自动更新 monorepo 内的内容，互相可以得到最新的代码
  - xyz 可以`import ABC from 'abc'`，如同发布的包
  - 所有依赖都是在顶层目录，每个依赖不会重复
  - 可以在顶层目录使用`npm install`安装所有项目的依赖
- "dependencies":
  1. xx: file:本地依赖目录(`npm install ../xx`)
