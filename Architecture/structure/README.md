- [monorepo](#monorepo)
    - [优点](#优点)
    - [缺点](#缺点)
- [As dependencies](#as-dependencies)
    - [优点](#优点-1)
    - [缺点](#缺点-1)
- [As assets](#as-assets)
    - [优点](#优点-2)
    - [缺点](#缺点-2)
- [micro-frontend](#micro-frontend)
  - [webpack module federation](#webpack-module-federation)
  - [Bit](#bit)
    - [优点](#优点-3)
    - [缺点](#缺点-3)

## [monorepo](./monorepo.md)

一套代码, 公用代码和主代码放在一个 monorepo 里

#### 优点

1. 维护方便
2. 便于统一的版本化, 适配不同代码时逻辑清晰

#### 缺点

1. 很容易形成复杂依赖, 导致很难上手及维护
2. 意味着难以区分职责范围, 导致推诿

## As dependencies

公用代码放在 dependencies 里

#### 优点

1. 便于维护和分别版本化
2. 迭代溯源清晰, 方便单元测试

#### 缺点

1. 不适用于快速迭代, 更新需要更新两套代码, 导致不易集成测试
2. 职责划分不清晰, 何时作为依赖, 何时写主代码里很难抉择

## As assets

将公用代码打包后, 以 assets 形式动态插入到打包结果里

#### 优点

1. 公用代码更新不会影响主代码, 公用代码甚至可以热更新
2. 公用代码不必和主代码使用相同的框架

#### 缺点

1. 动态插入逻辑复杂, 需要处理两套代码行为的不同特征, 增加维护难度
2. 对状态管理不友好, 即便是一个框架也需要动态注入的形式去处理公共状态
3. 自动化需要复杂的 ci/cd 流程

## micro-frontend

还很不成熟, 各种方案都有各自的优缺点

### [webpack module federation](./webpack-module-federation.md)

### Bit

https://www.youtube.com/@Bitdev/playlists

#### 优点

基于命令行工作，定位于"前端的 git-ish 工具"，绕过了其他框架的限制，可以很方便的做到微前端的组件版本控制、依赖管理、实时预览、CICD 集成等

#### 缺点

1. 更强调 component-based-composition，[主 app 也需要类似于该风格设计](https://youtu.be/9vS86xgG3ak?list=PL3EoIYR6kv0zqKkwAWFT3eJIBcNxEDD9T&t=540)。
2. 更强调于推 bit.cloud，自主搭建比较麻烦：https://github.com/teambit/bit/discussions/4707 https://github.com/teambit/bit/discussions/7406
3. 更强调开箱即用。要是切换微前端的风格或打包细节需要复杂的配置
