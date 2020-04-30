# ECMA

+ 变量修饰符
> var 可以重新声明(最小: function)<br/>
> let 局部(最小: block)<br/>
> const 对象属性可变, 对象不可变(最小: block)<br/>
> const A = Object.freeze(obj). 彻底不可变
+ 集合Set
> 同 python的Set<br/>
> const set = new Set();<br/>
> set.add(); set.has(); set.delate(); set.clear()<br/>
> 转为数组: var arr = Array.from(set)
+ 弱引用WeakSet
> 类似集合, 但有其它要求<br/>
> 集合内容只能是对象<br/>
> 不能使用for迭代(of, each)<br/>
> 对象删除后, 自动删除其引用
+ Map
> key在一个Map中可以不同<br/>
> 可以使用任何对象当作key, 不只是string(防止object自动转为"[Object]"字符串)<br/>
> map.set(key, value);  //更新添加都用它<br/> 
> map.get(key); map.size(); map.has(); map.delate(); map.clear()<br/>
> map.keys(); map.values(); map.entries()
+ WakeMap
> key只能是对象<br/>
> 无size, 不能循环迭代<br/>
> 对象删除后, 自动删除其引用
+ lambda函数
> () => { }<br/>
> 隐式返回 ()=> 2; //返回2<br/>
> this 指向 父作用域

##### 函数默认值
```js
//ECS6:
    function ES6(a=1){ }
//使用非最后一个的带默认值的参数,需要指定为undefined
//可以用来设置必要参数:
    function throw(){ throw new Error(); }
    function Foo(must=throw(), other){ }   //must是必要参数了
ECS5: function(a){ a=a|1 }
```
+ 模板字符串
> \`${person} is ${2} old\`<br/>
> 快捷拼接字符串, 可以是变量, 对象或函数<br/>
> 可以嵌套
+ 标签模板字符串
> 使用指定函数来处理模板字符串<br/>
> func\`temp\`<br/>
> func需定义为: function func(str, ...valus)<br/>
> str: 被模板字符串内${}切割的字符串<br/>
> ...values: 所有的${}
+ 变长参数
> ECS6: function(...args){}<br/>
> ECS5: function(){ arguments }<br/>
> args是一个数组, arguments是一个Object

#### 解构
**常用于:**

1. 交换变量 `[x, y] = [y, x]`
2. 从函数返回多个值 `function(){ return [r1, r2, ..] }`
3. 参数默认值 `function({sync=ture, cache=true}){ }`
##### 对象解构
+ 需要变量和属性名字相同
```js
//旧写法:
    age = Tom.age; name = Tom.name
//新写法:
    const { age, name } = Tom
//对已声明对象用于解构时
    let age, name;
    ({ age, name } = Tom)   //小括号是必要的. 防止js错误解析大括号
//但也可重命名:
    { name: Name } = Tom  //重命名为Name
//未定义时默认值:
    { sex = 'Male' } = Tom
```
##### 数组解构
```js
//快速拆解数组
    const [zero, , two] = Arrays
//支持: ...other
    const [zero, one, ...other] = Arrays     //但只能是最后一个
//只要等号两边的模式相同, 则可以对应赋值
    var [foo, [[bar, ], baz]] = [1, [[2, ], 3]]
//未定义时默认值
    [ zero=1 ] = []    //0号下标元素未定义
```
+ 简化赋值
> ECS6: 已知: name. Person = { name, age(){}, [name++]: name }<br/>
> ECS5: 已知: name, names. Person = { name: name, age:function(){}, name1: name }
+ Symbol
> const p = Symbol('p')<br/>
> 不可遍历, 唯一不重复
+ 模块
> export default Code<br/>
> 默认导出. 一个模块只有一个<br/>
> 使用 import XX from XXX 导入. XX自定义<br/>
> export const(let) Value<br/>
> 使用 import { Value } from XXX 导入. Value不可变<br/>
> 可以导出 function, 变量等<br/>
> 多变量导出: export { value1, value2, ...}
+ 类
> 继承: class A extends B { constructor(a,b){ super(a); }}<br/>
> 重写父类方法不需要任何关键字<br/>
> 静态函数: static func(){}<br/>
> super对象在普通方法指向父类原型prototype, static方法中指向父类
> set函数: set func(){}. 同C#的set<br/>
> get函数: get func(){}. 同C#的get
+ 数组推导
> 类似于python的数组赋值<br/>
> var a1 = [1, 2, 3, 4]<br/>
> var a2 = [for (i of a1) i*2], a2=[2,4,6,8]<br/>
> 可以加if判断: a2 = [for (i of a1) if (i%2==0) i*2], a2=[4,8]<br/>
> 可以多重循环: [for (i of a1) for (j of a1) console.log(i*j)]<br/>
> ES5: [1,2,3,4].map(function(i){ if(i%2==0){ return i*2 } })

#### Older type
```js
function Person(name, age){
    Human.call(this, name);
    this.age = age;
}
function Person.prototype = new Human();
function Person.prototype.constructor = Person;
Person.prototype.consoleName = function(){}

var p = new Person("name", 1);
```
+ Proxy代理
> const proxy = new Proxy(target, hander)<br/>
> 使用hander对象限定target的访问和重写其元方法.<br/>
> 通常: const hander = { set(target, key, value){ const target[key]=value; } get{ return target[key] } }

+ Reflect反射
[TODO write, mdn](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Reflect)
