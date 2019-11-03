# Typescript

- Typescript 的导入导出, 会自动根据使用环境编译为node形式或es6的形式
```ts
import m = require("mod");
export let t = m.something + 1;
```

## 数据类型
主要类型

- 和js用途一样的: boolean / number(都是浮点数) / string / Array / void / symbol
- object&emsp;表示非原始类型
- tuple&emsp;属于数组的一种
- any
- null & undefined&emsp;never类型的子类型
- never&emsp;表示从不会出现的值. 是任何类型的子类型，也可以赋值给任何类型

>几种声明

```ts
let tup:[number, string] = [1, 'str']; //tuple
let an:any = 1;    //any
let o:object = {name: "1"};    //object
let o:object = 1 | true | "str" ;  //Error
let arr:number[] = [1, 2, 3];  let arr:Array<number> = [1, 2, 3];   //array
let arr:(number | string | object)[] = [];   //联合数组, 数组值可以包涵联合的类型
let ro:ReadonlyArray<number> = arr;    //只读数组, ro不能被修改
let a:number[] = ro; //Error! 只读数组也不能赋值给普通数组, 除非用强制转换(类型断言)

//复杂声明，(一个变量可以有多种类型)
let i :number | undefined | null;
```
> 几种赋值

```ts
tup[3] = "world";   //tuple 访问一个越界的元素，会使用联合类型(这里是 string | number)替代
let a:any; a = 123; a=true;    //any
let nu:undefined;   //never
/*Error: 声明是never, 那么只能被声明的类型所赋值;
    nu=null;
    nu=never;   */
nu=undefined;

function error(message: string): never {    // 返回never的函数必须存在无法达到的终点
    throw new Error(message);
}
function fail() {   // 推断的返回值类型为never
    return error("Something failed");
}
function infiniteLoop(): never {    // 返回never的函数必须存在无法达到的终点
    while (true) {
    }
}
```

> 类型断言

```ts
let a:number[] = ro as number[];
let a:number[] = (<number[]>ro);   //这也是类型断言写法的一种
```

### 枚举
- 枚举是在运行时真正存在的对象
- 枚举类型与数字类型兼容，并且数字类型与枚举类型兼容. 但不同枚举类型之间是不兼容的
```ts
//数字枚举
enum ENUM{
    ENUM1,
    ENUM2=2,
    ENUM3= "123".length     //计算成员量. 详情看官网
};
//字符串枚举
enum ENUM{
    ENUM1="E1", //每个成员量都必须用字符串/另一个成员量进行初始化
    ENUM2="E2"  //字符串枚举不会自增长
};
//可以混合使用字符串枚举和数字枚举(称为异构枚举), 但不推荐

//常量枚举, 在编译阶段会被删除
const enum Enum {
    A = 1,
    B = A * 2
}
```

> 字面量枚举(枚举本身变成了联合)

```
enum ENUM{  //不含有计算成员量 || (全部成员量类型相同 && 成员量是string/整数类型)
    ENUM1,
    ENUM2,
}
//Error! 先检查x是否不是E.Foo. 如果失败, 那么x只能为 E.Foo, 因此没理由再去检查它是否为E.Bar
if(x != ENUM.ENUM1 || x != ENUM.ENUM2)
```

> 反向映射

```ts
enum Enum { A }
let a = Enum.A;
let nameOfA = Enum[a];  //"A", 可以由枚举的值得到它的名字
```

### 函数
- 同js一样, ts里函数也是数据类型之一

> 声明(匿名函数:函数类型)
```ts
let func: (e:array) => number   //声明类型
    = function(e:array):string{ return 'str'; }     //赋值
let myAdd = function(x: number): number { return x + 1; };   //相当于声明let myAdd:any;
let myAdd: (baseValue: number, increment: number) => number
    = function(x, y) { return x + y; };   //赋值时也可以省略类型, 参数名字也可以不一样
```

> 声明(普通函数)

```ts
function foo(s:number, a:string):number{ return 1; }
function bar():void{}
//可选参数
function fof(e?:boolean):void{}
//默认参数
function baf(r:number = 1):void{}
//剩余参数
function foa(...args:number[]):void{}
//返回值自动推断
function baa(s:number){ return s; }
```

> this
- ts的this总是第一个参数.
- this为void说明不需要一个this类型
- 普通类不需要这么麻烦, 但是有些回调函数会有this要求

```ts
interface Deck {
    info: string;
    createCardPicker(this: Deck): () => Card;
}
let deck: Deck = {
    info: "deck";   //如果使用this: void, 将无法调用this.info
    createCardPicker: function(this: Deck) {    //说明只能在Deck对象上调用该方法
        //如果要两个兼顾, 使用箭头函数解决(缺点是每个对象都会创建一个箭头函数)
        return 1;
    }
}
deck.createCardPicker();    //Ok
```

> 重载

```ts
let suits = ['heat', 'clubs'];
function pickCard(x: {suits: string; card: number;}[]): number; //重载声明: 1
function pickCard(x: number): {suits: string; card: number; };  //重载声明: 2
function pickCard(x): any{  //重载实现
    if(typeof x == "object") return x.length;   //调用声明1
    else if(typeof x == "number") return { suit: suits[1]; card: x%12 };    //调用声明2
}
```
## 类
- 访问修饰符有: static / public / private / protected / readonly(效果和Dart里类似)
```ts
//抽象类
abstract class Animal {
    abstract makeSound(): void;
    move(): void { console.log('roaming the earch...'); }   //可以包含成员的实现细节
}
class A {
    constructor(p: any){}   //构造函数
    constructor(readonly name: string) {}   //参数属性. 声明且赋值给readonly属性(支持其它的访问修饰符)
    private date:Date;  //私有属性
    name:string;    //默认为 public

    get name():Date{ return this.date; }
    set name(nV:Date){ this.date = nV; }    //只带有get不带有set的存取器自动被推断为 readonly
}
//继承, ts允许重写
class B extends A{
    constructor(p: any){ super(p); }
}
//实现接口, 实现后的接口属性全是public的
class C implements TSin{}   //一个类实现了一个接口时，只对其实例部分进行类型检查
```

> 高级技巧

```ts
class Greeter {
    static standardGreeting = "Hello, there";
    greeting: string;
    greet() {
        return Greeter.standardGreeting;
    }
}
let greeter1:Greeter = new Greeter();

let greeterMaker: typeof Greeter = Greeter;
greeterMaker.standardGreeting = "Hey there!";

let greeter2:Greeter = new greeterMaker();  //使用上一步"反射"出来的constructor
```

## 接口
- ts的接口和c的typeof类似
- 用于约束数据类型

```ts
interface TSin{ //JSON约束
    name?: string;  //可选
    age: number;
}
interface TSfu{   //函数类型约束
    (source: string, subString: string): boolean;
}
interface TSob{ //类约束
    name: string;
    (age:number): void;
}
//继承接口(多继承)
interface TSo extends TSin, TSout{
    color: string,
}
//接口的使用
let mad:TSfu = function(s: string, su: string):boolean{}
let square = <TSin>{};
function Tsfc(ts: TSin){
    if(ts.name) return ts.name + ts.age.toString();
}
```

> 只读属性

```ts
interface Point {
    readonly x: number;     //readonly 属性只能在对象刚刚创建的时候修改其值
    readonly y: number;
}
let p: Point = { x: 10, y: 20 };
p1.x = 5; // error!
```

> 索引属性(用于对数组/元组的约束)

```ts
interface TSin{
    name: string,   //如果有字符串索引, 那么其它的属性都需要是字符串索引返回值类型的子类型
    age: null,      //Error! `age`的类型与索引类型返回值的类型不匹配
    [propName: string]: any,    //签名[索引的类型]: 索引返回值类型
    [index: number]: number,    //数字索引的返回值必须是字符串索引返回值类型的子类型
}
let myArray: TSin;
myArray.xx = ["Bob", "Fred"];
let a:array = myArray["xx"];
```

> 混合类型(用于实现Js中复杂的对象的约束)

```ts
//如: 想要一个对象可以同时做为函数和对象
interface Counter {
    (start: number): string;
    interval: number;
    reset(): void;
}
function getCounter(): Counter {
    let counter = <Counter>function (start: number) { };
    counter.interval = 123;
    counter.reset = function () { };
    return counter;
}
let c = getCounter();
c(10);
c.reset();
c.interval = 5.0;
```

### 类和接口
```ts
//类定义会创建两个东西: 类的实例类型和一个构造函数. 因为类可以创建出类型, 所以你能够在允许使用接口的地方使用类
class Point {
    x: number;
    y: number;
}
interface Point3d extends Point {   //当接口继承了一个类时, 会继承类的成员但不包括其实现. 即接口声明了所有类中存在的成员, 但并没有提供具体实现
    z: number;
}
let point3d: Point3d = <Point3d>{x: 1, y: 2, z: 3};

//接口同样会继承到类的private和protected成员
//这种接口只能被这个类或其子类所实现. 但子类除了继承至基类外与基类没有任何关系
class Control {
    private state: any;
}
interface SelectableControl extends Control {
    select(): void;
}
class Button extends Control implements SelectableControl {
    select() { }
}
//Error: “Image”类型缺少“state”属性。
class Image implements SelectableControl {
    select() { }
}

//检查类的constructor. constructor存在于类的静态部分, 不能使用普通implement检查
interface ClockConstructor {
    new (hour: number, minute: number): ClockInterface;
}
interface ClockInterface {
    tick();
}
//真正用于检查的
function createClock(ctor: ClockConstructor, hour: number, minute: number): ClockInterface {
    return new ctor(hour, minute);
}
class DigitalClock implements ClockInterface {
    constructor(h: number, m: number) { }
    tick() {
        console.log("beep beep");
    }
}
let digital = createClock(DigitalClock, 12, 17);
```
## 泛型
```ts
//基本
function Ts<T>(arg: T):T{}
let s:string = Ts<string>("str");
//泛型数组
let arr:Array<T> = <Array<T>>[];   let arr:T[] = [];
//泛型类
class A<T>{ num:T; add:(a:T, b:T)=>T; }
let a:A<number> = new A<number>();
//泛型接口
interface TSt{ <T>(v:T):T; }    //type1
let i:TSt = function<T>(v:T):T{}
i<string>();

interface TSt<T>{ (v:T):T; }    //type2
let i:TSt<string> = function<T>(v:T):T{}
i();
```

> 泛型的约束

```ts
//带有.length属性的所有类型
interface Lengthwise { length: number; }
function logging<T extends Lengthwise>(arg: T):void {
    console.log(arg.length);  //it has a .length property, so no error
}
//带有空构造函数的所有类型
function create<T>(c: { new(): T; }): T {
    return new c();
}
function create<T>(c: ()=>T ): T {
    return new c();
}
```
## 装饰器
- 注意: 不能用在声明文件(.d.ts)，其它外部上下文(比如`declare`的类)或重载里

> 应用顺序:<br>
> 1. 参数装饰器 -> 方法装饰器 -> get/set装饰器 -> 字段属性装饰器(应用到每个实例成员)<br>
> 2. 参数装饰器 -> 方法装饰器 -> get/set装饰器 -> 字段属性装饰器(应用到每个静态成员)<br>
> 3. 参数装饰器应用到构造函数<br>
> 4. 类装饰器应用到类<br>
> 调用顺序:<br>
> 字段属性->方法->参数(从右往左)->类

```ts
//简单装饰器
//target: 对于静态成员和类来说是类的构造函数, 对于实例成员是类的原型(prototype)对象
//propertyKey: 成员的名字
//descriptor: 成员的属性描述符(字段属性没有, 且编译版本ES5以下也没有)
function log(target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor){}

@log @dec  //当复合log和dec时，复合的结果(log ∘ dec)(A)等同于log(dec(A))
class A{}
```
> 装饰器工厂(传参)

```ts
function logF(params: any){ //装饰器需要的参数
    //返回装饰器
    return function(target: any, propertyKey: string, descriptor: PropertyDescriptor){
        console.log("f(): called");
    }
}

@logF(params)
class A{}
```

> 参数装饰器 - 只能用来监视一个方法的参数是否被传入, 其返回值会被忽略
```ts
//target, argName和普通装饰器效果一样, 只有第三个参数变为: 参数在函数参数列表中的索引
function dec(target:any, argName:string, agrIndex:int){}

function fuc(@dec arg:any){}
```

## 命名空间
```ts
/// <reference path="Validation.ts" />  //如果其它文件需要声明该命名空间信息，那么第一行需要编译器指令. 使用时也需要?不确定
namespace a{
    export class A{}    //export后其它命名空间才能使用
}
namespace b{
    export namespace c{ //命名空间可以嵌套
    }
}

import c = b.c; //给命名空间内的东西起别名

var d = new a.A();
```
### 模块
- 如果使用ES6而非Node, 则和ES6的导入导出语法相同
```ts
//在node端需要, 支持CommonJS和AMD的exports
export = module;
import module = require("module");
```
> 动态加载

```ts
//Node.js
declare function require(moduleName: string): any;
import { ZipCodeValidator as Zip } from "./ZipCodeValidator";
if (needZipValidation) {
    let ZipCodeValidator: typeof Zip = require("./ZipCodeValidator");
    let validator = new ZipCodeValidator();
    if (validator.isAcceptable("...")) { /* ... */ }
}
//require.js
declare function require(moduleNames: string[], onLoad: (...args: any[]) => void): void;
import * as Zip from "./ZipCodeValidator";
if (needZipValidation) {
    require(["./ZipCodeValidator"], (ZipCodeValidator: typeof Zip) => {
        let validator = new ZipCodeValidator.ZipCodeValidator();
        if (validator.isAcceptable("...")) { /* ... */ }
    });
}
//System.js
declare const System: any;
import { ZipCodeValidator as Zip } from "./ZipCodeValidator";
if (needZipValidation) {
    System.import("./ZipCodeValidator").then((ZipCodeValidator: typeof Zip) => {
        var x = new ZipCodeValidator();
        if (x.isAcceptable("...")) { /* ... */ }
    });
}
```
