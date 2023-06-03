## npm

### 依赖管理逻辑

依赖会单独的在每个 package 里，之后有共同的依赖则会抽到根目录中去
针对 workspace 的是以软链接处理的 (`"lib":"workspace:version"`)

### 缺点

command 缺乏处理(如果要换文件结构，命令也要手动更换)
task 缺乏配置(只能用 package.json 管理 task，并行或串行全靠 bash)
cache 缺乏处理(只依赖于 node_modules 或框架的 cache 策略，无法透过 pnpm 这层调整)

## pnpm

### 依赖管理逻辑

和 npm 一样

### 常见命令

`pnpm-workspace.yaml` 处理 monorepo 的结构和配置

添加 package/dep 只需要按照正常的 npm 包添加即可(也可以使用 filter 指令`pnpm add --filter my-lib react`)

针对特点包的命令 `pnpm --filter my-app start`
给所有包的命令 `pnpm run -r start`

### 缺点

task 缺乏配置(只能要么串行`run -r`要么并行`run --parallel -r`)
cache 缺乏处理(只依赖于 node_modules 或框架的 cache 策略，无法透过 pnpm 这层调整)

## lerna

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
