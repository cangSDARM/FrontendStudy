# ReactNative

## 初始化
1. 安装`react-native-cli`
2. `raect-native init 项目名`初始化项目
3. 连接模拟器调试:
    - 在项目的android目录中创建`local.properties`的文件
    - 写入`sdk.dir =(Android SDK的目录路径)`
    - 执行`react-native start`开启服务状态
    - 使用`adb connect 127.0.0.1:模拟器端口`连接模拟器
    - 再在另一个终端执行`react-native run-android`将本地app打包成临时app同步到模拟器
4. 在模拟器中点击菜单键, 找到`dev settings`写入主机的IP和端口号(8081)
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
5. `Toggle Inspector`
6. `Show Perf Monitor`
7. `Start/Stop Sampling Profiler`
8. `Dev Settings`

## Undefined
1. react-native默认使用flex布局
2. react-native的组件宽高是组件的宽高, 不是内容的宽高