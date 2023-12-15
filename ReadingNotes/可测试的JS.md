- [相关名词及解释](#相关名词及解释)
  - [圈复杂度](#圈复杂度)
  - [扇出](#扇出)
  - [扇入](#扇入)
  - [耦合](#耦合)
    - [内容耦合](#内容耦合)
    - [公共耦合](#公共耦合)
    - [控制耦合](#控制耦合)
    - [标记耦合](#标记耦合)
    - [数据耦合](#数据耦合)
    - [无耦合](#无耦合)
  - [依赖注入](#依赖注入)
  - [代码覆盖率](#代码覆盖率)
    - [语句覆盖(StatementCoverage) or 行覆盖(LineCoverage) or 基本块覆盖(BasicBlockCoverage)](#语句覆盖statementcoverage-or-行覆盖linecoverage-or-基本块覆盖basicblockcoverage)
    - [判定覆盖(DecisionCoverage) or 分支覆盖(BranchCoverage) or 边界覆盖(All-EdgesCoverage) or 基本路径覆盖(BasicPathCoverage) or 判定路径覆盖(Decision-Decision-Path)](#判定覆盖decisioncoverage-or-分支覆盖branchcoverage-or-边界覆盖all-edgescoverage-or-基本路径覆盖basicpathcoverage-or-判定路径覆盖decision-decision-path)
    - [条件覆盖(ConditionCoverage)](#条件覆盖conditioncoverage)
    - [路径覆盖(PathCoverage) or 断言覆盖(PredicateCoverage)](#路径覆盖pathcoverage-or-断言覆盖predicatecoverage)
- [单元测试](#单元测试)
  - [原则](#原则)
  - [Mock 和 Stub](#mock-和-stub)
  - [Spy](#spy)
  - [测试自动化](#测试自动化)
  - [例子：Mocha + Chai + Sinon](#例子mocha--chai--sinon)
- [回归测试](#回归测试)
- [性能测试](#性能测试)
  - [浏览器解析 JS](#浏览器解析-js)
    - [HAR（HTTP Archive）](#harhttp-archive)
  - [负载测试](#负载测试)
- [混沌工程](#混沌工程)

[前端测试体系简略介绍]https://insights.thoughtworks.cn/frontend-testing/

## 相关名词及解释

### 圈复杂度

表示: 函数中独立现行路径的数量(分支数量), 即单元测试的最少个数

> 检查函数的圈复杂度 tool: jscheckstyle

### 扇出

表示其过程的内部调用的外部过程 + 其过程影响的外部数据

高扇出通常代表所在过程是程序的高压力点, 且该过程在做太多的事情需要重构

```js
//高扇出: 5+2
function make(ingredients) {
  var dinner = new Chicken(),
    oven = new Oven(),
    mixer = new Mixer(),
    dish = mixer.mix(dinner, ingredients);
  return oven.bake(dish, new Degrees(350), new Timer(50));
}
```

```js
//低扇出: 拆分(cooker, mixer) + 封装(bake, degree, timer)
function Cooker(oven) {
  this.oven = oven;
}
Cooker.prototype.bake = function (dish, deg, time) {
  return this.oven.bake(dish, deg, time);
};
Cooker.prototype.degree = function (deg) {
  return new Degrees(deg);
};
Cooker.prototype.timer = function (time) {
  return new Timer(time);
};
function make(ingredients, cooker, mixer) {
  var dinner = new Chicken();
  var dish = mixer.mix(dinner, ingredients);
  return cooker.bake(dish, cooker.degree(350), cooker.timer(50));
}
```

### 扇入

表示: 其过程内部引用的外部过程 + 欲从该过程获取信息的其他过程

高扇入代表这是高代码重用, 但顶层抽象和不常用功能应该有较少扇入

```js
// 扇入: 3 + n
function make(ingredients, cooker, mixer) {
  var dinner = new Chicken();
  var dish = mixer.mix(dinner, ingredients);
  return cooker.bake(dish, cooker.degree(350), cooker.timer(50));
}
```

### 耦合

#### 内容耦合

最差的一种, 包括: 在外部对象上调用方法或函数; 修改外都对象属性直接改变其状态

```js
O.property = "blash"; //changing O's state directly
O.method = function () {}; //changing O's internals
O.prototype.method = function () {}; //changing all Os
```

#### 公共耦合

也很差, 包括: 多个对象共享另外一个公共对象, 则这多个对象公共耦合

```js
var G = "global";
function A() {
  G = "A";
}
function B() {
  G = "B";
}
```

#### 控制耦合

差强人意, 包括: 过程控制外部对象的逻辑

```js
var abs = new Abstruct({ env: 1 }); //abs controlled Abstruct
```

#### 标记耦合

一般, 包括: 过程使用一个数据结构(而不是简单数据), 但只使用了其一部分

```js
O.prototype.make = function (args) {
  return args.age++;
};
O.make({ type: "A", age: 1 }); //only age used
```

#### 数据耦合

不错, 包括: 对象传递消息数据, 且外部对象的逻辑流程不被数据影响

```js
O.prototype.fun = function (val) {
  return val++;
};
O.fun(15); //data can change, but fun's logic can be clear and breaf without the data
```

#### 无耦合

完美

### 依赖注入

IoS 原则(控制反转), 则可注入的对象可以被第三方控制单元所控制, 从而实现控制与逻辑的解耦

```js
//强依赖, 无注入, 高耦合:
var Space = function () {
  this.engine = new SpaceEngine();
  this.booster = new Booster();
  this.arm = new ARM();
};
//可注入, 控制耦合:
var Space = function (engine, booster, arm) {
  this.engine = engine;
  this.booster = booster;
  this.arm = arm;
};
```

### 代码覆盖率

用于度量被测代码中的逻辑考虑是否周全

#### 语句覆盖(StatementCoverage) or 行覆盖(LineCoverage) or 基本块覆盖(BasicBlockCoverage)

度量被测代码中每个可执行语句是否被执行到了。**只统计能够执行的代码被执行了多少行。**

例子(测试已经 100%覆盖):

```js
function foo(a, b) {
  return a / b;
}

test("StatementCoverage", () => {
  foo(10, 5);
});
```

是最弱的覆盖。未考虑代码逻辑问题(如除零)

#### 判定覆盖(DecisionCoverage) or 分支覆盖(BranchCoverage) or 边界覆盖(All-EdgesCoverage) or 基本路径覆盖(BasicPathCoverage) or 判定路径覆盖(Decision-Decision-Path)

它度量程序中每一个判定的分支是否都被测试到了。**只需要考虑每个分支的判定结果**

例子(测试已经 100%覆盖):

```js
function foo(a, b) {
  // 判定
  if (a < 10 || b < 10) {
    return 0; // 分支一
  } else {
    return 1; // 分支二
  }
}

test("DecisionCoverage", () => {
  foo(5, 1); // 分支一
  foo(15, 15); // 分支二
});
```

未考虑判定条件的覆盖，容易写出忽略条件短路的测试

#### 条件覆盖(ConditionCoverage)

它度量判定中的每个子表达式结果 true 和 false 是否被测试到了。**只需要考虑每个分支判断条件的结果，忽略组合结果。**

例子(测试已经 100%覆盖):

```js
function foo(a, b) {
  // 判定
  if (a < 10 || b < 10) {
    return 0; // 分支一
  } else {
    return 1; // 分支二
  }
}

test("DecisionCoverage", () => {
  foo(1, 15); // 分支一
  foo(15, 1); // 分支一
});
```

没有考虑组合结果完整性，容易写出如例子中只覆盖分支一的测试

#### 路径覆盖(PathCoverage) or 断言覆盖(PredicateCoverage)

它度量了是否函数的每一个分支都被执行了。**需要将所有可能的分支都执行，有多个分支嵌套时，需要对多个分支进行排列组合。**

例子(测试已经 100%覆盖):

```js
function foo(a, b) {
  let ret = 0;
  if (a < 10) {
    ret += 1;
  }
  if (b < 10) {
    ret += 2;
  }
  return ret;
}

test("DecisionCoverage", () => {
  foo(1, 1);
  foo(1, 15);
  foo(15, 1);
  foo(15, 15);
});
```

最强的覆盖。但测试内容随着分支的数量指数级别增加

## 单元测试

### 原则

1. 隔离: 测试是代码的最小部分--函数, 通过模(mock), 桩(stub)和测试替身(test double)来隔离被测试的代码
2. 范围: 只测试一种函数, 不应该依赖于调用或使用的其他函数
3. 规范: 函数的参数和返回值应该是合理定义和注释的, 单元测试才是高效的
4. 测试用例: 必须和代码保持同步, 且按照规范所定义
5. 正向测试: 对正确用例的输入, 应该有正确的输出
6. 负向测试: 对于传入的非期望的用例, 应该有良好的处理

### Mock 和 Stub

1. mock 和 stub 都是通过创建自己的对象来替代次要测试对象, 然后按照测试的需要控制这个对象的行为
2. stub 有一个显式的实现, stub 的方法也会有具体的实现
3. mock 的实现类通常是有 mock 的工具包来隐式实现
4. 但在实际的开发测试过程中, 其实 mock 和 stub 的界限有时候很模糊, 并没有严格的划分方式

### Spy

1. spy 对象类似于一个装饰器. spy 调用时会调用需要测试的真实代码, 而通常在其前后加上内容

### 测试自动化

1. 可以在浏览器里加载对应代码然后进行测试, 但这样效率很低
2. 也可以使用 Headless 的浏览器 + Selenium 自动化测试<br/>
   [Headless 的浏览器清单](https://github.com/dhamaniasad/HeadlessBrowsers)<br/>
   [测试框架对比](https://www.cnblogs.com/lihuanqing/p/8533552.html)<br/>

### 例子：Mocha + Chai + Sinon

- [Mocha](https://github.com/mochajs/mocha) Mocha 可以持续运行测试，支持报告，当映射到未捕获异常时转到正确的测试示例
- [Chai](https://github.com/chaijs/chai) 是一个 BDD 和 TDD 的断言库
- [Sinon](https://github.com/sinonjs/sinon) 是一个独立的 spy, stub, mock 库，没有依赖任何单元测试框架工程

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

## 回归测试

回归是回到以前或欠发达的状态。在软件测试中，回归测试是指确保应用到软件系统的新更改不会无意中破坏以前工作的东西。

视觉回归测试通过比较代码更改前后截取的屏幕截图来检查最终用户看到的差异。

使用 Playwright 进行视觉回归测试：https://lost-pixel.com/blog/post/playwright-visual-regression-testing

## 性能测试

[性能测试概述](https://www.cnblogs.com/yanghj010/p/6020986.html)

### 浏览器解析 JS

不同浏览器有不同的速度分析工具。<br/>
如：

1. Firefox 和 IE 的 dynaTrace AJAX Edition
2. Chrome 的 Lighthouse 扩展

#### [HAR](http://www.softwareishard.com/blog/har-12-spec/)（HTTP Archive）

**是一个用来储存 HTTP 请求/响应信息的通用 UTF-8 编码文件格式，基于 JSON。**<br/>

> 可以使得 HTTP 监测工具（如浏览器）导出所收集的数据。<br/>
> 这些数据可以被 HTTP 分析工具（包括 Firebug，httpwatch，Fiddler 等）用来分析网站的性能瓶颈。<br/> > [概览](https://blog.csdn.net/euyy1029/article/details/52350736)

### 负载测试

**负载测试衡量页面的时间、内存、磁盘和 CPU 利用率等**

> 相关工具 Apache Bench

## 混沌工程

混沌工程师通过应用一些经验探索的原则，来观察系统是如何反应，通过实践对系统有更新的认知以揭露可能设计时未考虑的问题。

原则/步骤:

1. 选择一个假设(需要模拟真实环境，如网络宕机、资源抢占、硬件占用等，即系统变为了混沌状态)
2. 选择试验的范围(整个系统宕机不是很好)
3. 明确需要观察的 metric 指标(明确现有系统的负载能力，加钱就能解决的指标不需要考虑)
4. 通知相关的团队
5. 执行试验
6. 分析结果
7. 增大试验的范围(增加混乱范围，增加系统健壮性)
8. 自动化
