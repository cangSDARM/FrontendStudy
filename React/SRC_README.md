# React组件化编程
+ 组件分离: **将UI分解为可重用的部分**
+ 1.可变export组件
    + **组件名在page中自定义**
    + 在pages中:
        + `import 组件名 from "../components/ComponentsName.js"`
    + 在component中:
        + `export default () => <h1>This is a header.</h1>`
+ 2.不可变const组件
    + **组件名不可变**
    + 在pages中:
        + `import 组件名 from "../components/ComponentsName.js"`
    + 在component中:
        + `const Header = () => <h1>This is a header.</h1>`
        + `export default Header`
## 生命周期
+ `constructor`: 构造函数
+ `componentWillMount()`: 组件激活时调用
+ `render()`: 数据发生变化时调用
+ `componentDidMount()`: 组件激活成功时调用
+ **"DOM比较"**
+ `componentWillReceiveProps()`: 受父组件更新影响时调用
+ `shouldComponentUpdate(nextProps, nextState)`: 组件被更新之前调用. 返回true才更新
+ `componentWillUpdate()`: 组件更新时调用
+ `render()`: 组件渲染(必须存在)
+ `componentDidUpdate()`: 组件更新后调用
+ `componentWillUnmount()`: 组件失效时调用
## 注意
+ pages中也需要`export default xxx`
## 入口文件: /pages/index.js