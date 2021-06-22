<!-- TOC -->

- [基础部分](#基础部分)
  - [严格模式](#严格模式)
  - [变量提升](#变量提升)
  - [常见方法](#常见方法)
  - [类型转换](#类型转换)
  - [void运算符](#void运算符)
  - [泛型方法](#泛型方法)
- [Tip](#tip)
    - [Object.preventExtensions](#objectpreventextensions)
    - [Object.seal](#objectseal)
    - [RegExp的/g死循环](#regexp的g死循环)
    - [尾调用优化](#尾调用优化)
    - [自定义JSON格式](#自定义json格式)

<!-- /TOC -->
[JS比较表](https://dorey.github.io/JavaScript-Equality-Table/)

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
void (function(){ return 1; })() //undefined
void 1+4    //undefined
```
### 泛型方法
```js
var Wine = Object.create(Object, {
    AddAge: function(years){
        return this.age += years;
    }
});
var john = {age:51};
Wine.prototype.AddAge.call(john, 3) //借助call, apply, bind等实现泛型
john.age    //54
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
#### RegExp的/g死循环
```js
while(/a/g.test('baabaa')) count++;     //dead loop
while(/a/g.exec('abasbs')) count--;     //dead loop
//解决办法:
let reg = /a/g; //将reg提取出来
while(reg.test() || reg.exec())
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
#### 自定义JSON格式
简而言之需要实现`toJSON`方法。该方法会在`JSON.stringify`时尝试调用
```js
const json = JSON.stringify({
  answer: { toJSON: () => 42 }
});
console.log(json); // {"answer":42}

class HTTPErr extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }

  toJSON() {
    return { message: this.message, status: this.status };
  }
}
const e = new HTTPError('Fail', 404);
console.log(JSON.stringify(e)); // {"message":"Fail","status":404}
```
