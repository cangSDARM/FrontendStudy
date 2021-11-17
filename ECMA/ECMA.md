# ECMA

- 变量修饰符
  > var 可以重新声明(最小: function)<br/>
  > let 局部(最小: block)<br/>
  > const 对象属性可变, 对象不可变(最小: block)<br/>
  > const A = Object.freeze(obj). 彻底不可变
- 集合 Set
  > 同 python 的 Set<br/>
  > const set = new Set();<br/>
  > set.add(); set.has(); set.delate(); set.clear()<br/>
  > 转为数组: var arr = Array.from(set)
- 弱引用 WeakSet
  > 类似集合, 但有其它要求<br/>
  > 集合内容只能是对象<br/>
  > 不能使用 for 迭代(of, each)<br/>
  > 对象删除后, 自动删除其引用
- Map
  > key 在一个 Map 中可以不同<br/>
  > 可以使用任何对象当作 key, 不只是 string(防止 object 自动转为"[Object]"字符串)<br/>
  > map.set(key, value); //更新添加都用它<br/>
  > map.get(key); map.size(); map.has(); map.delate(); map.clear()<br/>
  > map.keys(); map.values(); map.entries()
- WakeMap
  > key 只能是对象<br/>
  > 无 size, 不能循环迭代<br/>
  > 对象删除后, 自动删除其引用
- lambda 函数
  > () => { }<br/>
  > 隐式返回 ()=> 2; //返回 2<br/>
  > this 指向 父作用域
- 模板字面量
  > \`${person} is ${2} old\`<br/>
  > 快捷拼接字符串, 可以是变量, 对象或函数<br/>
  > 可以嵌套
- 标签模板字面量
  > 使用指定函数来处理模板字面量<br/>
  > func\`temp\`<br/>
  > func 需定义为: function func(str: string[], ...values) -> any<br/>
  > str: 被模板字面量内${}切割的字面量 (包含一个 row 属性，可以获取未转义的原始字符串，也可以直接使用String.row``)<br/>
> ...values: 所有的${}
- 变长参数
  > ECS6: function(...args){}<br/>
  > ECS5: function(){ arguments }<br/>
  > args 是一个数组, arguments 是一个 Object
- 简化赋值
  > ECS6: 已知: name. Person = { name, age(){}, [name++]: name }<br/>
  > ECS5: 已知: name, names. Person = { name: name, age:function(){}, name1: name }
- Symbol
  > const p = Symbol('p')<br/>
  > 不可遍历, 唯一不重复
- 模块
  > export default Code<br/>
  > 默认导出. 一个模块只有一个<br/>
  > 使用 import XX from XXX 导入. XX 自定义<br/>
  > export const(let) Value<br/>
  > 使用 import { Value } from XXX 导入. Value 不可变<br/>
  > 可以导出 function, 变量等<br/>
  > 多变量导出: export { value1, value2, ...}

#### 函数默认值

```js
//ECS6:
    function ES6(a=1){ }
//使用非最后一个的带默认值的参数,需要指定为undefined
//可以用来设置必要参数:
    function throw(){ throw new Error(); }
    function Foo(must=throw(), other){ }   //must是必要参数了

ECS5: function(a){ a = a|1 }
```

#### 解构

**常用于:**

1. 交换变量 `[x, y] = [y, x]`
2. 从函数返回多个值 `function(){ return [r1, r2, ..] }`
3. 参数默认值 `function({sync=ture, cache=true}){ }`

##### 对象解构

- 需要变量和属性名字相同

```js
//旧写法:
    age = Tom.age; name = Tom.name
//新写法:
    const { age, name } = Tom
//对已声明对象用于解构时
    let age, name, rest;
    ({ age, name, ...rest } = Tom)   //小括号是必要的. 防止js错误解析大括号
//但也可重命名:
    { name: Name } = Tom  //重命名为Name
//未定义时默认值:
    { sex = 'Male' } = Tom
//可以和简化赋值的共用
    let { ['z']: foo } = { z: "bar" }   //foo "bar"
```

##### 数组解构

```js
//快速拆解数组
const [zero, , two] = Arrays;
//支持: ...other
const [zero, one, ...other] = Arrays; //但只能是最后一个
//只要等号两边的模式相同, 则可以对应赋值
var [foo, [[bar], baz]] = ([1, [[2], 3]][
  //未定义时默认值
  (zero = 1)
] = []); //0号下标元素未定义
```

##### 复杂解构

```js
let [{ age }] = [{ age: 8, name: "xx" }, "深圳", [1, 2, 3]];
```

##### for-of 中解构

```js
for (var {name: n, family: {father: f}} of people)
```

#### 类

> 继承: class A extends B { constructor(a,b){ super(a); }}<br/>
> 重写父类方法不需要任何关键字<br/>
> 静态函数: static func(){}<br/>
> super 对象在普通方法指向父类原型 prototype, static 方法中指向父类<br/>
> set 函数: set func(){}. 同 C#的 set；get 类似<br/>

- Older type

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

-- 类表达式

```js
//可以是匿名的
let Foo = class {
  constructor() {}
  bar() {
    return "Hello World!";
  }
};
new Foo().bar();
Foo = class {}; //类表达式允许重新赋值

//可以是具名的
const Foo = class NamedFoo {
  constructor() {}
  whoIsThere() {
    //主要用于类的内部引用类本身，外部是undefined的
    return NamedFoo.name;
  }
};
```

#### Proxy 代理

> `const proxy = new Proxy(target, hander)`<br/>
> 使用 hander 对象限定 target 的访问和重写其元方法.<br/>
> hander 会捕获[特定的 trap 动作](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy#handler_%E5%AF%B9%E8%B1%A1%E7%9A%84%E6%96%B9%E6%B3%95)

例子:

```js
const hander = {
    set: function(target, key, value){
        const target[key] = value;
        return true; //表示成功
    },
    get: function(target, key, receiver){
        return target[key]
    }
}
```
