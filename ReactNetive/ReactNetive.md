# ReactNetive

## 初始化
1. 安装`react-native-cli`
2. `raect-native init 项目名`初始化项目
3. 连接模拟器调试:
    - 在项目的android目录中创建`local.properties`的文件
    - 写入`sdk.dir =(Android SDK的目录路径)`
    - 执行`react-netive start`开启服务状态
    - 使用`adb connect 127.0.0.1:模拟器端口`连接模拟器
    - 再在另一个终端执行`react-netive run-android`将本地app打包成临时app同步到模拟器
4. 在模拟器中点击菜单键, 找到`dev settings`写入主机的IP和端口号(8081)
5. 再使用`react-netive run-andriod`

## 结构
> - RN
>   |- android
>   |- ios
>   |- node_modules
>   .babelrc
>   .buckconfig
>   .flowconfig
>   .gitattrbute
>   .watchmanconfig
>   App.js
>   app.json
>   index.js
>   package.json
>   package.lock

## Undefined
1. react-native默认使用flex布局