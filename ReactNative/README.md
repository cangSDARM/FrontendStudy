# ReactNative
<!-- TOC -->

- [初始化](#初始化)
- [结构](#结构)
- [Dev Menu](#dev-menu)
- [规范](#规范)

<!-- /TOC -->

## 初始化
1. 安装`react-native-cli`
2. `raect-native init 项目名`初始化项目
3. 连接模拟器调试:
    - 在项目的android目录中创建`local.properties`的文件
    - 写入`sdk.dir =(Android SDK的目录路径)`
    - 执行`react-native start`开启服务状态
    - 使用`adb connect 127.0.0.1:模拟器端口`连接模拟器
    - 再在另一个终端执行`react-native run-android`将本地app打包成临时app同步到模拟器
4. 绑定更新端口
    - Android5.0以下: 在模拟器中点击菜单键, 找到`dev settings`写入主机的IP和端口号(8081)
    - Android5.0以上: `adb reverse tcp:8081 tcp:8081` 
5. 再使用`react-native run-andriod`

## 结构
> - RN
>   |- android
>   |- ios
>   |- node_modules
>   .babelrc
>   .buckconfig
>   .flowconfig
>   .watchmanconfig
>   App.js
>   app.json
>   index.js
>   package.json
>   package.lock

## Dev Menu
1. `Reload`重新加载代码更新
2. `Debug JS Remotely`打开控制台(浏览器的)
3. `Enable Live Reload`使用实时更新
4. `Enable Hot Reloading`使用热更新
5. `Toggle Inspector`显示样式
6. `Show Perf Monitor`显示应用的当前帧数
7. `Start/Stop Sampling Profiler`
8. `Dev Settings`

## 规范
1. react-native默认使用flex布局
2. react-native的组件宽高是组件的宽高, 不是内容的宽高
3. react-native的颜色使用CSS3规范, 和css操作相同
4. 使用Chrome的`React Dev Tools`调试组件关系, 和Console窗口查看`debuggerWorker.js`调试props, chlid

# 参考文档
**https://reactnative.cn/docs/tutorial.html**

1. 所有内置的组件: https://reactnative.cn/docs/components-and-apis/
2. 页面跳转: https://reactnative.cn/docs/navigation/#react-navigation
3. 动画: https://reactnative.cn/docs/animations/
4. 无障碍: https://reactnative.cn/docs/accessibility/
5. 性能调优: https://reactnative.cn/docs/performance/
6. 响应的生命周期: https://reactnative.cn/docs/gesture-responder-system/
7. DOM操作: https://reactnative.cn/docs/direct-manipulation/
8. 集成到现有app: https://reactnative.cn/docs/integration-with-existing-apps/
9. 其它平台支持: https://reactnative.cn/docs/out-of-tree-platforms/

# Rust and RN

1. https://medium.com/@marekkotewicz/building-a-mobile-app-in-rust-and-react-native-part-1-project-setup-b8dbcf3f539f
2.https://github.com/paritytech/parity-signer
