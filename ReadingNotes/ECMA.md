- [函数默认值](#函数默认值)
- [解构](#解构)
  - [对象解构](#对象解构)
  - [数组解构](#数组解构)
  - [复杂解构](#复杂解构)
  - [for-of 中解构](#for-of-中解构)
- [Proxy 代理](#proxy-代理)
  - [可撤销的代理](#可撤销的代理)
- [Reflect 反射](#reflect-反射)

# ECMA

- 变量修饰符
  > var 可以重新声明(最小: function)<br/>
  > let 局部(最小: block)<br/>
  > const 对象属性可变, 对象不可变(最小: block)<br/>
  > const A = Object.preventExtensions(obj). 不许添加属性 <br/>
  > const B = Object.seal(obj). 不许修改属性 <br/>
  > const C = Object.freeze(obj). 彻底不可变(shallow)
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
  > 不可遍历, 唯一不重复<br/>
  > 可以使用 const p1 = Symbol.for('p'), p2 = Symbol.for('p'); p1 === p2; 称为 Symbol 全局注册表<br/>

### 函数默认值

```js
//ECS6:
    function ES6(a=1){ }
//使用非最后一个的带默认值的参数,需要指定为undefined
//可以用来设置必要参数:
    function throw(){ throw new Error(); }
    function Foo(must=throw(), other){ }   //must是必要参数了

ECS5: function(a){ a = a|1 }
```

### 解构

**常用于:**

1. 交换变量 `[x, y] = [y, x]`
2. 从函数返回多个值 `function(){ return [r1, r2, ..] }`
3. 参数默认值 `function({sync=ture, cache=true}){ }`

#### 对象解构

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
//还可以多次解构同一个key
    {profile: { img }, profile: { birth }} = Tom
//未定义时默认值:
    { sex = 'Male' } = Tom
//可以和简化赋值的共用
    let { ['z']: foo } = { z: "bar" }   //foo "bar"
```

#### 数组解构

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

#### 复杂解构

```js
let [{ age }] = [{ age: 8, name: "xx" }, "深圳", [1, 2, 3]];

let a;
({ a = '1' } = { a: 1 }); //outer brackets are required
```

#### for-of 中解构

```js
for (var {name: n, family: {father: f}} of people)
```

### Proxy 代理

> `const proxy = new Proxy(target, handler)`<br/>
> 使用 handler 对象限定 target 的访问和重写其元方法.<br/>
> handler 会捕获[特定的 trap 动作](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy)<br/>
> 严格相等性检查 `===` 无法被拦截<br/>

```js
const target = {
  age: 10,
  looseGet() {
    return this.age;
  },
  strictGet() {
    if (this !== target) throw 'Error';
    return this.age;
  }
}

const handler = {
  set: function(target, key, value){
    const target[key] = value;
    return true; //表示成功
  },
  get: function(target, key, receiver){
    // trap a method call
    // ⚠️如果使用这种方法，则只会代理浅层属性的访问(属性内部访问了 this 时绕过了proxy, 此时就不会捕获), 只会捕获到 looseGet
    // 否则，`this`会被替换(不是 target, this 依然是"proxied"), strictGet 会报错
    if (typeof target[key] === 'function') {
      const origMethod = target[key].bind(target);
      return function (...args) {
        const result = Reflect.apply(origMethod, target, args);
        return result;
      };
    }

    return Reflect.get(target, key, receiver);
  },
  apply(target, thisArg, args) {//允许包装后的对象被 ()/call/apply 调用
    setTimeout(() => target.apply(thisArg, args), ms);
  }
}
```

#### 可撤销的代理

> 代理会将操作转发给对象，并且我们可以随时将其禁用

```js
let object = {
  data: "Valuable data"
};
const {proxy, revoke} = Proxy.revocable(object, {});
// 将 proxy 传递到其他某处，而不是对象...
alert(proxy.data); // Valuable data
revoke();
// proxy 不再工作（revoked）
alert(proxy.data); // Error
```

### Reflect 反射

> 提供拦截元操作(.[], (), new, delete)的方法
>
> 规范化：Object 里已有的明显属于元编程的函数挪到 Reflect 里，并修正不合理行为<br/>
> 函数化：in/new/delete 命令操作函数化<br/>
> 和Proxy的使命相同：提供元编程功能

```js
Reflect.apply(target, this, [...args]); // 通过指定的参数列表发起对target函数调用
Reflect.construct(target, [...args], newTarget); // new target()，构造函数内部的new.target值会指向target
Reflect.defineProperty(target, key, attr);   // 设置属性描述值，Object 失败抛异常，Reflect 返回布尔值。
Reflect.deleteProperty(target, key);  // delete target[key]，唯一不同是返回布尔值。
Reflect.get(target, key);  // target[key]，但它是通过一个函数执行来操作的
Reflect.set(target, key, value); // target[key]=value，唯一不同是返回布尔值。
Reflect.getOwnPropertyDescriptor(target, key); // 获取属性的属性描述符，当属性不存在时返回 undefined。Reflect 抛异常，Object 强制转换非 Object
Reflect.getPrototypeOf(target);  // 获取对象的原型对象，Reflect 抛异常，Object 强制转换非 Object
Reflect.has(target, key); // key in target，返回布尔值。Reflect 抛异常，Object 强制转换非 Object
Reflect.ownKeys(target); // 等同于 Object.getOwnPropertyNames(target).concat(Object.getOwnPropertySymbols(target))
Reflect.isExtensible(target);  // 判断一个对象是否可扩展（即是否能够添加新的属性）。Reflect 抛异常，Object 强制转换非 Object
Reflect.preventExtensions(target);  // 阻止新属性添加到对象。Reflect 抛异常，Object 强制转换非 Object
Reflect.setPrototypeOf(target, prototype); // 为对象设置新的原型对象。Reflect 返回布尔值，Object 返回新对象
```
