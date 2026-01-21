<!-- TOC -->

- [基础部分](#基础部分)
  - [变量提升](#变量提升)
  - [常见方法](#常见方法)
  - [类型判断](#类型判断)
  - [void 运算符](#void-运算符)
  - [类](#类)
    - [Older type](#older-type)
    - [类表达式](#类表达式)
    - [类继承](#类继承)
  - [模块](#模块)
  - [Date](#date)
  - [Regex](#regex)
    - [RegExp 的/g 死循环](#regexp-的g-死循环)
    - [差交并补集](#差交并补集)
    - [扩展 unicode 支持](#扩展-unicode-支持)
    - [断言](#断言)
    - [内联标识符](#内联标识符)
    - [捕获替换](#捕获替换)
- [Binary](#binary)
  - [TypedArray](#typedarray)
  - [SharedArrayBuffer](#sharedarraybuffer)
    - [Atomics](#atomics)
  - [Binary Operators](#binary-operators)
  - [Blob](#blob)
- [Tip](#tip)
    - [FinalizationRegistry](#finalizationregistry)
    - [Object.preventExtensions](#objectpreventextensions)
    - [Object.seal](#objectseal)
    - [尾调用优化](#尾调用优化)

<!-- /TOC -->

[JS 比较表](https://dorey.github.io/JavaScript-Equality-Table/)

## 基础部分

### 变量提升

**所有变量都会被提升：声明会被移动到函数的开始处，而赋值在原处进行**

```js
//user defined
function foo() {
  console.log(tmp);
  if (false) {
    var tmp = 3;
  }
}
//program see
function foo() {
  var tmp;
  console.log(tmp);
  if (false) {
    tmp = 3;
  }
}
```

### 常见方法

```js
//Array------------------------------------------------------------------------
arr.splice(1, 2); // remove 2 elements begin at index 1, (safely and anyIndexing)
arr.copyWithin(1, 2, 3); // move something in index [2, 3) to [1, 3-(2-1))
// map、reduce、filter、forEach 等高阶函数沿着数组的索引键遍历。empty array 没有索引键
Array.from({ length: 2 }); //create non-empty array
//number------------------------------------------------------------------------
const clamp = (num: number, min: number, max: number) =>
  Math.min(Math.max(num, min), max);
Number.EPSILON; // the minimum double number
```

### 类型判断

```js
// 可以判断区分出 Null/undefined/Array/Object
Object.prototypes.toString.call(undefined); //[object undefined]
Object.prototypes.toString.call(null); //[object null]
Object.prototypes.toString.call([]); //[object array]
Object.prototypes.toString.call(function () {}); //[object function]

// 不能区分 Null/Array/Object
typeof undefined; //undefined
typeof null; //object
typeof []; //object
typeof function () {}; //function

// 可以区分具体的Object
student instanceof Student; //true
leader instanceof Leader; //true
```

### void 运算符

```js
//执行但返回undefined
void (function () {
  return 1;
})(); //undefined
void 1 + 4; //undefined
```

### 类

> 继承: class A extends B { constructor(a,b){ super(a); }}<br/>
> 重写父类方法不需要任何关键字<br/>
> 静态函数: static func(){}<br/>
> super 对象在普通方法指向父类原型 prototype, static 方法中指向父类<br/>
> set 函数: set func(){}. 同 C#的 set；get 类似<br/>

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

// 泛型
var Wine = Object.create(Object, {
  AddAge: function (years) {
    return (this.age += years);
  },
});
var john = { age: 51 };
Wine.prototype.AddAge.call(john, 3); //借助call, apply, bind等实现泛型
john.age; //54
```

#### 类表达式

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

#### 类继承

```js
function f(phrase) {
  return class {
    sayHi() { alert(phrase); }
  };
}
// 在 extends 后允许任意表达式
class User extends f("Hello") {}  //继承自 f("Hello") 的结果
new User().sayHi();
```

### 模块

- 模块仅在第一次导入时被解析。之后不管在哪在什么位置导入第二次都不会执行

```ts
export * from "antd";
export { Modal } from "./Modal"; // reexport 的 具名导出 优先级比 * 高

export default Code; // 默认导出. 一个模块只有一个
export { value1, value2, ...} // 多变量导出
```

### Date

由于设计问题，方法有对应的时区问题。每个方法的时区都不尽相同

- Use UTC-based operations whenever possible
- Use Z or a time offset when parsing strings
- Use `Temporal` to operate Date, use `Date` to parse Date

```js
//Without Z: Input is January 27 (implicitly in the Europe/Paris time zone), output is January 26 (in UTC).
new Date("2077-01-27T00:00").toISOString();
// With Z: Input is January 27, output is January 27.
new Date("2077-01-27T00:00Z").toISOString();

// 时间可以比较（默认转为timestamp后比较）
assert.equal(new Date("1972-05-03") < new Date("2001-12-23"), true);
```

### Regex

```js
/abc/; // 加载时编译
new RegExp("abc"); // 运行时编译
str.replace(/(.*)and/, "$1but"); // 替换最后一个出现的字符。原理：正则表达时，贪婪模式，.*会一直匹配到最后一个
//使用Reg时, 如果不是立即使用, 最好确定 reg.global == true 和 reg.lastIndex == 0;
```

#### RegExp 的/g 死循环

```js
while(/a/g.test('baabaa')) count++;     //dead loop
while(/a/g.exec('abasbs')) count--;     //dead loop
//解决办法:
let reg = /a/g; //将reg提取出来
while(reg.test() || reg.exec())
```

#### 差交并补集

要启用字符类的集合操作，必须能够嵌套它们。当标志符 `/v` 时，我们可以额外嵌套字符类

```js
// 差集
/[\w--[a-g]]$/v.test("h");
/[\p{Number}--[0-9]]$/v.test("٣");
/[\w--a]$/v.test("b");

// 交集
/[\p{ASCII}&&\p{Letter}]/v.test("D");
/[\p{Script=Arabic}&&\p{Number}]$/v.test("٣");

// 并集
/[\p{Emoji_Keycap_Sequence}[a-z]]+$/v.test("a2️⃣c");

// 补集
/[\P{Letter}]/v.test("1");
```

#### [扩展 unicode 支持](./字符系统.md)

#### 断言

```js
// 前向断言
// regex(?=«pattern»)
// 仅当 pattern 满足时，匹配 regex
"abcX def".match(/[a-z]+(?=X)/g); // abc

// 取反的前向断言
// regex(?!«pattern»)
// 当 pattern 满足时，则匹配 regex
"abcX def".match(/[A-z]+(?!X)[A-z]/g); // [abc, def]
// 注意 断言并不消耗字符，因此必须抽出[A-z]给regex判断。否则+直接贪婪匹配全部
// 等价于
"abcX def".match(/[A-z]+[A-z](?<!X)/g);

// 后向断言
// (?<=«pattern»)regex
// 仅当 pattern 满足时，匹配 regex
"Xabc def".match(/(?<=X)[a-z]+/g); // abc

// 取反的后向断言
// (?<!«pattern»)regex
// 当 pattern 满足时，则匹配 regex
"Xabc def".match(/(?<!X)[a-z]+/g); // bc def
```

#### 内联标识符

只有 `i, m, s` 支持

```js
// (?«flags»:regex)
// 激活标识

/^x(?i:HELLO)x$/.test("xHELLOx"); // true
/^x(?i:HELLO)x$/.test("xhellox"); // true

// (?-«flags»:regex)
// 取消标识

/^x(?-i:HELLO)x$/i.test("XHELLOX"); // true
/^x(?-i:HELLO)x$/i.test("XhelloX"); // false
```

#### 捕获替换

```js
// $$       $ 符号
// $&       匹配后的内容
// $`       匹配内容前面的字符(*贪婪)
// $'       匹配内容后面的字符(*贪婪)
// $<name>  匹配组

"+0a1 a2".replace("a", "|$`$&|"); // +0|+0a|1 a2
"+0a1 a2".replace("a", "|$&$'|"); // +0|a1 a2|1 a2
"+0a1 a2".replace(/(a)(1)/, "|$2$1|"); // +0|1a| a2
"+0a1 a2".replace(/(?<a>a)(?<n>1)/, "|$<n>$<a>|"); // +0|1a| a2
```

## Binary

### TypedArray

![Typed](../assets/TypedArray.png)

- `ArrayBuffer`是核心对象，是对固定长度的连续内存区域的引用
- 几乎任何对`ArrayBuffer`的操作，都需要一个视图(TypedArray/DataView)
- TypedArray 中我们无法`splice`/`concat`，因为是视图，并且 buffer 是固定的、连续的内存区域。我们所能做的就是分配一个零值

### SharedArrayBuffer

- 普通的 js primitive 数据(如`string`, `ArrayBuffer`)是 transferable 的, 但 clone 了
- 只有`SharedArrayBuffer`是共享同一片内存。也因此在多进程环境下, js 也有竞态条件需要处理

```js
const sharedBuffer = new SharedArrayBuffer(10);

const workers = Array.from({ length: 2 }).map(() => new Worker('worker.js'));
workers.forEach((worker, workerId) => 
  worker.postMessage({ workerData: sharedBuffer, workerId });
);

// worker
self.onmessage = ({ data: { workerData, workerId } }) => {
  const typedArray = new Int8Array(workerData);
  typedArray[0] = workerId;
  console.dir({ workerId, value: typedArray[0] });
}
```

#### [Atomics](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Atomics)

注意，现在 js 库的 Mutex/Semaphore 实现都是通过自己维护队列实现，不是真的多线程信号量

```diff
const typedArray = new Int8Array(workerData);
- typedArray[0] = workerId;
- console.dir({ workerId, value: typedArray[0] });
+ // Two Atomic Operation (store, load)
+ Atomics.store(typedArray, 0, workerId);
+ const value = Atomics.load(typedArray, 0);
+ console.dir({ workerId, value });
```

### Binary Operators

- 按位非`~a` 反转操作数的比特位，即 0 变成 1，1 变成 0。对数值进行按位非操作的结果为`-(a + 1)`
- 左移`a << b` 将 a 的二进制形式向左移 b(< 32) 比特位，右边用 0 填充
- 有符号右移`a >> b` 将 a 的二进制表示向右移 b(< 32) 位，正数/负数左侧用 0/1 填充
- 无符号右移`a >>> b` 将 a 的二进制表示向右移 b(< 32) 位，左侧用 0 填充

```ts
class Permission {
  public static Mask1 = 1 << 0; // 0001
  public static Mask2 = 1 << 1; // 0010
  public static Mask3 = 1 << 2; // 0100
  public static Mask4 = 1 << 3; // 1000
  public static Ele5 = Permission.Mask3 | Permission.Mask1; // 0101

  // 存储目前的权限状态
  private flag;

  // 重新设置权限
  public setPermission(permission) {
    flag = permission;
  }

  /** 添加一项或多项权限
   * 如果flag变量没有permission，则“|”完后flag对应的位的值为1如果已经有permission，则“|”完后值不会变，对应位还是1
   */
  public enable(permission) {
    flag |= permission;
  }

  /** 删除一项或多项权限
   * 先对permission进行取反则permission原来非0的那一位变为0，然后使用“&”运算后如果flag变量非0的那一位变为0，则意味着flag变量不包含permission
   */
  public disable(permission) {
    flag &= ~permission;
  }

  /** 是否拥某些权限
   * 如果flag变量里包含permission，则“&”完后flag对应的位的值为1，因为permission的定义保证了只有一位非0，其他位都为0，所以如果是包含的话进行“&”运算后值不为0，该位上的值为此permission的所在位上的值，不包含的话值为0
   */
  public isAllow(permission) {
    return (flag & permission) == permission;
  }

  // 是否禁用了某些权限
  public isNotAllow(permission) {
    return (flag & permission) == 0;
  }

  // 是否仅仅拥有某些权限
  public isOnlyAllow(permission) {
    return flag == permission;
  }
}

const permission = Permission.Ele5; // 0101
permission & Permission.Mask5; // 0101 & 0101 = 1 true
permission & Permission.Mask3; // 0101 & 0100 = 1 true

if (permission.isAllow(NewPermission.ALLOW_UPDATE | ALLOW_DELETE)) {
  //...
}

// round
(Math.round(somenum) === 0.5 + somenum) |
  ((0 === ~~(0.5 + somenum)) === (0.5 + somenum) << 0);
// floor
Math.floor(somenum) === (somenum | 0);
// euclideanModulo。保持符号位不变的取余
somenum - othernum * Math.floor(x / a);
```

### Blob

Blob 相比于 ArrayBuffer, 添加了文件感知和 MIME 信息

```js
const link = document.createElement("a");
link.download = "hello.txt";

// 第一个参数必须是一个数组 [...] (ArrayBuffer、类型化数组、DataView、Blob、File 或 string)
const blob = new Blob(["Hello, world!"], { type: "text/plain" });

// 从 blob 获取 arrayBuffer
const buffer = await blob.arrayBuffer();
// 从 blob 获取 readableStream
const readableStream = blob.stream();

// Blob 对象是不可改变的(如字符串对象)，但可以从旧的创建新的
const slicedBlob = blob.slice(0, blob.length, "text/txt");

// objectURL 形式为 blob:<origin>/<uuid>
// 如；blob:https://javascript.info/1e67e00e-860d-40a5-89ae-6ab0cbee6273
link.href = URL.createObjectURL(slicedBlob);

link.click();

// 如果我们创建一个 URL，那么即使我们不再需要 Blob 了，它也会被挂在内存中。因此需要 revoke
URL.revokeObjectURL(link.href);
```

```js
// file 继承自 blob，所以 FileReader 一些方法可以处理 Blob
const reader = new FileReader();
reader.readAsDataURL(blob); // 将 Blob 转换为 base64 并调用 onload

reader.onload = function () {
  // data-url 的形式为 data:[<mediatype>][;base64],<data>
  // 如：data:text/plain;base64,SGVsbG8sIHdvcmxkIQ==
  link.href = reader.result; // data url
  link.click();
};
```

## Tip

#### FinalizationRegistry

```js
const registry = new FinalizationRegistry((heldValue) => {
  // 当 obj 被垃圾回收时，这里(可能)会执行(依赖于具体引擎实现)
  console.log(heldValue); // 'some value'
});

// 监听一个对象被垃圾回收事件
registry.register(obj, "some value", objToken);

// 取消监听
// use obj itself as the unregister token (objToken), which is just fine
registry.unregister(objToken);
```

#### Object.preventExtensions

```js
var obj = function () {
  Object.preventExtensions(this);
};
Object.isExtensible(obj); //false
var m = new obj(); //m的属性不能被添加和修改了(可以删除). 除非调用了已经存在的API
```

#### Object.seal

```js
var obj = Object.create({}, { foo: { value: 1, enumerable: false } });
Object.seal(obj); //使得无法修改obj的属性(可迭代, 可写, 可配置)
Object.isSealed(obj); //true
obj.foo = "b"; //可以修改值
```

#### 尾调用优化

```js
//未优化
function F() {
  return B() * 1;
}
function F() {
  var r = B() * 2;
  return r;
}
//优化
function F() {
  return B(2);
}
```
