https://www.kancloud.cn/chandler/web_technology/3076199

## nx

### 依赖管理逻辑

nx 可以只当 task/cache 管理用。此时 monorepo 管理按照其他的为主。

依赖在根目录中，和根目录中版本不一致的会放到单独目录中去。
针对 workspace 的是以软链接处理的 (`"lib":"workspace:version"`)

### 常见命令

`nx.js` 处理 tasks 的结构和配置

添加 package/dep 只需要按照正常的 npm 包添加即可

针对特点包的命令 `nx run my-app:start`
给所有包的命令 `nx run start`
查看依赖关系 `nx graph`
只影响 git 改动的包 `nx affected:command`
组合命令(task) `nx run-many --target=build --packages=../p --target=start --packages=../a`
