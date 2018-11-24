# ECS6

+ 变量修饰符
> var 可以重新声明(最小: function)<br/>
> let 局部(最小: block)<br/>
> const 对象属性可变, 对象不可变(最小: block)<br/>
> const A = Object.freeze(obj). 彻底不可变
+ 集合Set
> 同 python的Set<br/>
> const set = new Set();<br/>
> set.add(); set.has(); set.delate(); set.clear()
+ 弱引用WeakSet
> 类似集合, 但有其它要求<br/>
> 集合内容只能是对象<br/>
> 不能使用for迭代(of, each)<br/>
> 对象删除后, 自动删除其引用
+ Map
> 键值对. js的字典<br/>
> key在一个Map中可以不同<br/>
> map.set(); map.get(key); map.size(); map.has(); map.delate(); map.clear()
+ lambda函数
> () => { }<br/>
> 隐式返回 ()=> 2; //返回2<br/>
> this 指向 父作用域
+ 函数默认值
> ECS6 -> function(a=1)<br/>
> 使用非最后一个的带默认值的参数,需要指定为undefined<br>
> ECS5 -> function(a){ a=a|1 }
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
+ 对象结构
> const { age, name } = Tom<br/>
> let age, name; ({ age, name } = Tom )<br/>
> 这相当于: age = Tom.age; name = Tom.name<br/>
> 需要变量和属性名字相同<br/>
> 可以重命名: { name: Name } = Tom. 重命名为Name<br/>
> 未定义时默认值: { name = 'Tom' } = Tom
+ 数组结构
> 快速拆解数组<br/>
> const [zero, , two] = Array<br/>
> 支持: ...other. 但只能是最后一个<br/>
> 未定义时默认值: [zero=1] = Array
+ 简化赋值
> ECS6: 已知: name. Person = { name, age(){}, [name++]: name }<br/>
> ECS5: 已知: name, names. Person = { name: name, age:function(){}, name1: name }
+ Promise
> const p = new Promise((reslove, reject)=>{ })<br/>
> p.then(data=>{}).catch(err=>{})<br/>
> reslove: 成功时调用, then捕获. reject: 失败时调用, catch捕获<br/>
> then可以返回一个Promise, 来链式调用<br/>
> 异步
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
> set函数: set func(){}. 同C#的set<br/>
> get函数: get func(){}. 同C#的get
+ 生成器(协程)
> function* func(){ const a = yield ""; }<br/>
> const gene = func()<br/>
> gene.next(A)  调用. 之后a=A
+ Proxy代理
> const proxy = new Proxy(target, hander)<br/>
> 使用hander对象限定target的访问和重写其元方法.<br/>
> 通常: const hander = { set(target, key, value){ const target[key]=value; } get{ return target[key] } }