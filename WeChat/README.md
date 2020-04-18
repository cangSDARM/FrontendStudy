# 微信小程序

提供了自己的视图层描述语言`WXML`和`WXSS`及`Javascript`

| | 传统Web | 小程序 |
| -- | :--- | :--- |
| 结构 | HTML | WXML |
| 样式 | CSS | WXSS |
| 逻辑 | Javascript | Javascript |
| 配置 | 无 | JSON |

***
## 基本目录
    | -pages                        小程序的页面目录
        | - index                   首页
              index.js              对应js
              index.wxml            类似于html
              index.wxss
        | - logs                    其它页面
              logs.js
              logs.json             logs页面自己的配置文件
              logs.wxml
              logs.wxss
    | - utils
        util.js                     相关工具文件
    app.js                          全局的js, 类似于app.js
    app.json                        全局配置文件
    app.wxss                        全局的样式文件 | 会被具体页面的配置覆盖
    project.config.json             类似于package.json

### 自定义组件
> 一个组件类似于页面, 由 JSON/WXML/WXSS/JS四个文件组成