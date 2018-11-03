# ECS6

+ 变量
> var 可以重新声明(最小: function)<br/>
> let 局部(最小: block)<br/>
> const 对象属性可变, 对象不可变(最小: block)<br/>
> const A = Object.freeze(obj). 彻底不可变
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
> func\`temp\`<br/>
> func需定义为: function func(str, ...valus)<br/>
> str: 被模板字符串内${}切割的字符串<br/>
> ...values: 所有的${}
+ 变长参数
> ...args<br/>
> args是一个数组, 里面就是所有的参数
