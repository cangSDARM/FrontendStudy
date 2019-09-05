# 深入理解Javascript

## 基础部分
### 严格模式
**开启激活更多的警告，使得代码更严谨**
```js
'use strict';   //切换严格模式。必须在文件第一行写
function funInStrict(){
    'use strict';   //在函数里也可以对该函数切换严格模式
    return [012, 0x12]; //严格模式中不能声明除十进制以外的进制数

    //严格模式不会自动拆箱
    String.prototype.m = ()=>console.log(typeof this);  //object. in not strict
    String.prototype.sm = ()=>console.log(typeof this);   //string. in strict
}
```
### 变量提升
**所有变量都会被提升：声明会被移动到函数的开始处，而赋值在原处进行**
```js
//user defined
function foo(){
    console.log(tmp);
    if (false){
        var tmp = 3;
    }
}
//program see
function foo(){
    var tmp;
    console.log(tmp);
    if (false){
        tmp = 3;
    }
}
```
### 常见方法
```js
//Array------------------------------------------------------------------------
arr.shift() //remove first element
arr.unshift()   //prepend an element(push an element to be first)
arr.splice(1, 2)    //remove 2 elements begin at index 1, (safely and anyIndexing)
//Reg------------------------------------------------------------------------
/^abc$/.test('att') //try test Reg
/abc/   //加载时编译
new RegExp('abc')   //运行时编译
/^.$/u.test('的')    //正确匹配Unicode字符
//使用Reg时, 如果不是立即使用, 最好确定 reg.global == true 和 reg.lastIndex == 0;
//string------------------------------------------------------------------------
'abc'.slice(-2, -2)   //写负数会 加上字符串的长度 再slice
'的'.codePointAt(0)  //返回字符串对应位置的Unicode编号, 能正确处理四字节或两字节
String.fromCodePrint(134071)    //返回Unicode编号对应的字符串
//Other------------------------------------------------------------------------
typeof x === 'undefined'    //test x exists and is undefined
Object.observe(); Object.unobserve()    //监听对象变化(共6种变化)
Array.observe(); Array.observe()    //监听数组变化(共4种, CURD)
```
### 类型转换
```js
// == 和 ===
2 == true //false. 2===1
2 == false //false. 2===0
1 == true //true. 1===1
0 == false //true. 0===0
'' == false //true. 0===0
'1' == true //true. 1===1
'2' == true //false. 2===1
'abc' == true //false. NaN === 1
new String('aa') == new String('aa')    //false
```
### void运算符
```js
//执行但返回undefined
void (function(){ return 1;})() //undefined
void 1+4    //undefined
```
### toString
```js
//没有 1.toString() 这种写法
1..toString()
1 .toString()
(1).toString()
1.0.toString()
```
### 泛型方法
```js
var Wine = Object.create(Object, {AddAge: function(years){ return this.age += years; }})
var john = {age:51}
Wine.prototype.AddAge.call(john, 3) //借助call, apply, bind等实现泛型
john.age    //54
```
## 懒加载
**img的src设置时才会向服务器发起请求加载图片**<br/>
**因此懒加载目的就在于让img在可视区域时才获得src属性**
```jsx
//首先在DOM节点保存将要加载的属性：
<img data-img="img/base64:pngxxxx" />   //data-*属性来存储数据
//之后在可视区域时
<img src="img/base64:pngxxxx" />    //将data-*换成src属性
```
## Tip
#### Object.preventExtensions
```js
var obj = function(){Object.preventExtensions(this);};
Object.isExtensible(obj)    //false
var m = new obj();  //m的属性不能被添加和修改了(可以删除). 除非调用了已经存在的API
```
#### Object.seal
```js
var obj = Object.create({}, {foo: {value:1, enumerable: false}})
Object.seal(obj)    //使得无法修改obj的属性(可迭代, 可写, 可配置)
Object.isSeled(obj) //true
obj.foo = 'b';  //可以修改值
```
#### ToArray
```js
let arr = Array.from('..'); //将类数组对象转为数组
arr.forEach();  //则之后就可调用数组方法
```
#### RegExp的/g死循环
```js
while(/a/g.test('baabaa')) count++;     //dead loop
while(/a/g.exec('abasbs')) count--;     //dead loop
//解决办法:
let reg = /a/g; //将reg提取出来
while(reg.test() || reg.exec())
```
#### lookup表
```js
function validate(x){   //一种switch-case的替代方案
    var lookup = {x: 'doc', y:'root'}, doz = function (){
        // body...
    };
    lookup[x] ? lookup[x]() : doz();
}
```
#### 尾调用优化
```js
//未优化
function F(){
    return B() * 1;
}
function F(){
    var r = B() * 2;
    return r;
}
//优化
function F(){
    return B(2);
}
```