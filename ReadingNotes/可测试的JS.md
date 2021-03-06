# 可测试的JS

## 圈复杂度
### 表示: 函数中独立现行路径的数量(分支数量), 即单元测试的最少个数
##### 检查函数的圈复杂度tool: jscheckstyle

## 扇出
### 表示其过程的内部调用的外部过程 + 其过程影响的外部数据
##### 高扇出通常代表所在过程是程序的高压力点, 且该过程在做太多的事情需要重构
```js
//高扇出: 5+2
function make(ingredients){
	var dinner = new Chicken()
		, oven = new Oven()
		, mixer = new Mixer()
		, dish = mixer.mix(dinner, ingredients);
	return oven.bake(dish, new Degrees(350), new Timer(50));
}
```
```js
//低扇出: 拆分(cooker, mixer) + 封装(bake, degree, timer)
function Cooker(oven){ this.oven = oven; }
Cooker.prototype.bake = function (dish, deg, time) { return this.oven.bake(dish, deg, time); }
Cooker.prototype.degree = function (deg) { return new Degrees(deg); }
Cooker.prototype.timer = function(time){ return new Timer(time); }
function make(ingredients, cooker, mixer){
	var dinner = new Chicken();
	var dish = mixer.mix(dinner, ingredients);
	return cooker.bake(dish, cooker.degree(350), cooker.timer(50));
}
```
## 扇入
### 表示: 其过程内部引用的外部过程 + 欲从该过程获取信息的其他过程
##### 高扇入代表这是高代码重用, 但顶层抽象和不常用功能应该有较少扇入
```js
// 扇入: 3 + n
function make(ingredients, cooker, mixer){
	var dinner = new Chicken();
	var dish = mixer.mix(dinner, ingredients);
	return cooker.bake(dish, cooker.degree(350), cooker.timer(50));
}
```
## 耦合
##### 内容耦合. 最差的一种, 包括: 在外部对象上调用方法或函数; 修改外都对象属性直接改变其状态
```js
O.property = 'blash';	//changing O's state directly
O.method = function(){};	//changing O's internals
O.prototype.method = function(){};	//changing all Os
```
##### 公共耦合. 也很差, 包括: 多个对象共享另外一个公共对象, 则这多个对象公共耦合
```js
var G = 'global';
function A() { G = 'A'; }
function B() { G = 'B'; }
```
##### 控制耦合. 差强人意, 包括: 过程控制外部对象的逻辑
```js
var abs = new Abstruct({env: 1})	//abs controlled Abstruct
```
##### 标记耦合, 一般, 包括: 过程使用一个数据结构(而不是简单数据), 但只使用了其一部分
```js
O.prototype.make = function(args){ return args.age++; }
O.make({ type: "A", age: 1 })	//only age used
```
##### 数据耦合, 不错, 包括: 对象传递消息数据, 且外部对象的逻辑流程不被数据影响
```js
O.prototype.fun = function(val){ return val++; }
O.fun(15)	//data can change, but fun's logic can be clear and breaf without the data
```
##### 无耦合, 完美
## 依赖注入
### IoS原则(控制反转), 则可注入的对象可以被第三方控制单元所控制, 从而实现控制与逻辑的解耦
```js
//强依赖, 无注入, 高耦合:
var Space = function(){
	this.engine = new SpaceEngine();
	this.booster = new Booster();
	this.arm = new ARM();
}
//可注入, 控制耦合:
var Space = function(engine, booster, arm){
	this.engine = engine;
	this.booster = booster;
	this.arm = arm;
}
```
## 单元测试
### 原则
1.	隔离: 测试是代码的最小部分--函数, 通过模(mock), 桩(stub)和测试替身(test double)来隔离被测试的代码
2.	范围: 只测试一种函数, 不应该依赖于调用或使用的其他函数
3.	规范: 函数的参数和返回值应该是合理定义和注释的, 单元测试才是高效的
4.	测试用例: 必须和代码保持同步, 且按照规范所定义
5.	正向测试: 对正确用例的输入, 应该有正确的输出
6.	负向测试: 对于传入的非期望的用例, 应该有良好的处理
7.	代码覆盖率: 指单元测试中, =(执行代码/非执行代码行数)*100%
### Mock和Stub
1.	mock和stub都是通过创建自己的对象来替代次要测试对象, 然后按照测试的需要控制这个对象的行为
2.	stub有一个显式的实现, stub的方法也会有具体的实现
3.	mock的实现类通常是有mock的工具包来隐式实现
4.	但在实际的开发测试过程中, 其实mock和stub的界限有时候很模糊, 并没有严格的划分方式
### Spy
1.	spy对象类似于一个装饰器. spy调用时会调用需要测试的真实代码, 而通常在其前后加上内容
### 测试自动化(集成测试)
1. 可以在浏览器里加载对应代码然后进行测试, 但这样效率很低
2. 也可以使用Headless的浏览器 +  Selenium自动化测试<br/>
[Headless的浏览器清单](https://github.com/dhamaniasad/HeadlessBrowsers)<br/>
[测试框架对比](https://www.cnblogs.com/lihuanqing/p/8533552.html)<br/>

### 测试工具链 Mocha + Chai + Sinon
##### [Mocha](https://github.com/mochajs/mocha) 是 JavaScript 测试框架，可以运行在 Node.js 和浏览器中。Mocha 可以持续运行测试，支持报告，当映射到未捕获异常时转到正确的测试示例
##### [Chai](https://github.com/chaijs/chai) 是一个针对 JavaScript 的BDD和TDD的断言库，可与任何 JavaScript 测试框架集成
##### [Sinon](https://github.com/sinonjs/sinon) 是一个独立的 JavaScript 测试spy, stub, mock库，没有依赖任何单元测试框架工程
```bash
npm install -g mocha
npm install sinon
npm install chai
```
```js
//纯Mocha
//describe (moduleName, testDetails)
//	describe可以嵌套。这里describe就可以理解成希望测试Array模块下的#indexOf()子模块。module_name 是随便取的，关键是要让人读明白
//it(info, function)
//	info字符串会写期望的正确输出的简要一句话文字说明
//	一个it对应一个实际的test case
//assert.equal(exp1, exp2)
//	这里采取的等于判断是==而并非===
var assert = require("assert");
describe('Array', function(){
    describe('#indexOf()', function(){
        it('should return -1 when the value is not present', function(){
            assert.equal(-1, [1,2,3].indexOf(5));
            assert.equal(-1, [1,2,3].indexOf(0));
        })
    })
});
//Mocha + Chia
//	这里只是使用了Chai的 expect 风格(还有Should, Asset，具体参考官网)
var expect = require("chai").expect;
describe("Array#indexOf", function(){
	it('should return -1 when the value is not present', function(){
		expect([1, 2, 3].indexOf(5).to.equal(-1));
		expect([1, 2, 3].indexOf(0).to.equal(-1));
	})
})
//Mocha + Chia + Sinon
var sinon = require('sinon');
var stub = sinon.stub();
var expect = require("chai").expect;
var o = {
	'engine': [1, 2, 3] 
	'indexOf' : (arg) => {
		return this.engine.indexOf(arg);
	}
}
// 将 o.indexOf 替换成一个stub，使用完毕后需要调用stub.restore() 或 o.indexOf.restore 复原。
var stub = sinon.stub(o, 'indexOf', function(arg){
	console.log("Replaced");
});
describe("Array#indexOf", function(){
	it('should return -1 when the value is not present', function(){
		expect(stub.call(5)).to.be.equal(-1);
	})
})
```
## 性能测试
### [概述](https://www.cnblogs.com/yanghj010/p/6020986.html)
### 浏览器解析JS
不同浏览器有不同的速度分析工具。<br/>
如：

1. Firefox和IE的dynaTrace AJAX Edition
2. Chrome的Speed Tracer扩展
#### [HAR](http://www.softwareishard.com/blog/har-12-spec/)（HTTP Archive）
**是一个用来储存HTTP请求/响应信息的通用UTF-8编码文件格式，基于JSON。**<br/>
> 可以使得HTTP监测工具（如浏览器）导出所收集的数据。<br/>
> 这些数据可以被HTTP分析工具（包括Firebug，httpwatch，Fiddler等）用来分析网站的性能瓶颈。<br/>
> [概览](https://blog.csdn.net/euyy1029/article/details/52350736)
### 负载测试
**负载测试衡量页面的时间、内存、磁盘和CPU利用率等**
> 相关工具 Apache Bench
## 自动化构建
### gulp/grunt 和 webpack 强调的点不相同，在一个项目中可以一起使用, [参考](https://www.cnblogs.com/lovesong/p/6413546.html)
##### [grunt](https://www.gruntjs.net/) 是js任务管理工具
优势：出来早 社区成熟  插件全  
缺点：配置复杂   效率低 (cpu占用率高) 
##### [gulp](https://www.gulpjs.com.cn/) 基于流的自动化构建工具
优点：配置简单 效率高 流式工作(一个任务 的输出作为另一个任务的输入)  优点正好是grunt缺点  
缺点：出现晚  插件少
##### [webpack](https://www.webpackjs.com/) 模块打包机
优点：模块化   
缺点：配置复杂