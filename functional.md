Functional Programming is a fancy name for _Lambda Calculus with Haskell typeclass using Category/Set terminology_ implemented in other languages

- [Lambda Calculus](#lambda-calculus)
  - [Calculation Rules](#calculation-rules)
    - [α-Conversion](#α-conversion)
    - [β-Reduction](#β-reduction)
    - [η-Reduction](#η-reduction)
  - [Free \& Binding](#free--binding)
  - [Currying](#currying)
- [Haskell-ish](#haskell-ish)
  - [Terminology](#terminology)
  - [Tacit Functions](#tacit-functions)
    - [柯里化 Currying](#柯里化-currying)
    - [偏函数](#偏函数)

## Lambda Calculus

a **formal system**

`(λy. x(yz))(ab)`(用 ES6 的表达就是 `(y => x(y,z))(ab)`)

- `y,x,z,a,b` are _variables_
- `ab, yz` are _expressions_
- `x(yz), (λy. x(yz))(ab)` are _function calls_
- `λy` means it's _lambda calculus_(aka _lambda header_, `x(yz)` is _lambda body_, `.` split header and body)

分为两个部分：

1. 定义`λy. x(yz)`，表示"一个参数为 y 的函数，返回值为 x(yz) 表达式的计算结果";
2. 运算`(λy. x(yz))(ab)`，表示"带入实参 ab 计算 Lambda 表达式"，(计算后)可以简写为`x(abz)`

### Calculation Rules

#### α-Conversion

值与 Lambda 无关，也不重要

即：
`λy. x(y)` == `λx. y(x)` == `λwhatever. something(whatever)`

#### β-Reduction

Lambda 演算以外部实参值替代内部行参值的方式进行

即：
`(λy. x(y))(ab)` =β> `x(ab)`
`(λz. (λx. xz))(x)(2)` =α> `(λz. (λy. yz))(x)(2)` =β> `(λy. yx)(2)` =β> `2x`

#### η-Reduction

当且仅当分别通过 α/β 得到相同的结果，两个 Lambda 表达式才是相同的

### Free & Binding

如果一个值是一个 Lambda 表达式的参数，我们则称这个值是(被)绑定的(complete binding/closure)

即：
`λy. (λz. x(yz))`，内层 Lambda 中 x, y 是自由的，z 是绑定的；外层中 x 是自由的，y, z 是绑定的

一个 Lambda 表达式只有在其所有值都是绑定的时候才完全合法。关注某个子表达式时，自由变量是允许存在的(以 free(x)表示 Lambda x 表达式中自由的值的数量)。

### Currying

Lambda 表达式只接受一个参数。
因为函数就是值，因此可以将 Lambda 返回值替换为一个函数，再调用返回的表达式即可。
这就是柯里化。

即：`λy. (λz. x(yz))`(ES6 `y => z => x(y, z)`)

## Haskell-ish

### Terminology

_Arity_ is the number of parameters in a function declaration.
a function with arity 1 is called _unary_, with 2 is called _binary_, with 3 or higher is called _n-ary_.

A function that receives or returns one or more other function values is called _higher-order function_.

_functor_ is an "atom data-structure" which supports mapping (precisely: morphism) operations and preserves composition (results still support mapping). Example: Array = functor + other terminologies.

_monad_ is an "atom object" in the fp-world that defines the minimum protocol to communicate with the base language and the fp world (mappable, composable and immutable). monad based on functor.

_tacit programming_, or more commonly: _point-free style_. The term "point" here is referring to a function's parameter input: `[1,2,3,4,5].map( unary( double ) )`, which you cannot see the input flow, it been hidden.

### Tacit Functions

Goal: Avoid using language sugar directly, As point-free(tacit programming) as possible.

```ts
const unary = (fn) => (arg) => fn(arg);
[1, 2].map((v) => parseInt(v));
[1, 2].map(unary(parseInt));

const identity = (v) => v;
[1, 2].filter((v) => !!v);
[1, 2].filter(identity);

const constant = (v) => () => v;
p1.then(() => p2).then();
p1.then(constant(p2)).then();

const apply = (fn) => (arr) => fn(...arr);
Math.max(...[1, 2, 3]);
apply(Math.max)([1, 2, 3]);
const unapply =
  (fn) =>
  (...args) =>
    fn(args);

const when =
  (predicate, fn) =>
  (...args) =>
    predicate(...args) ? fn(...args) : undefined;
when(window, console.log);

// complement === not
const complement =
  (predicate) =>
  (...args) =>
    !predicate(...args);
complement(Boolean)(false);

const compose = (...fn) => fn.length === 0 ? (arg) => arg : fn.reduce((a, b) => (arg) => a(b(arg)));
const h = compose(curry(add)(1), curry(plus)(2)); // h(x) = g(f(x))
h(2); // => (2 + 1) * 2 === 6

const transduce = 
  (trans, accel, init, input) =>
  input.reduce((acc, cur)
    => accel(acc, trans(cur)),
    init
  );
const initial = [];
const input = [1, 2, 3];
const accelerator = (acc, b) => acc.push(b);
const transformer = pipe(curry(add)(1), filter(isEven));
transduce(transformer, accelerator, initial, input);  // [2,4]
```

#### 柯里化 Currying

The concept itself is named after Haskell Curry, who developed it.

指将一个函数从可调用的 `f(a, b, c)` 转换为可调用的 `f(a)(b)(c)`

```js
function curry(func, arity = func.length) {
  return function curried(...args) {
    if (args.length >= arity) {
      return func(...args);
    } else {
      return (...args2) => curried(...args.concat(args2));
    }
  };
}
// no need to know the length of parameters
const dynamicCurry = (fn) => {
  return function curried(...args) {
    return function next(...nextArgs) {
      if (nextArgs.length === 0) {
        // end state
        return fn(...args);
      }
      return curried(...args, ...nextArgs);
    };
  };
};
let curriedSum = curry(sum, 3);
curriedSum(1, 2, 3);
curriedSum(1)(2, 3);
curriedSum(1)(2)(3);
dynamicCurrySum(1)(2)(3)();

function uncurry(fn, arity = func.length) {
  return (...args) => {
    let ret = fn,
      argsIn = [...args];
    while (typeof ret === "function") {
      // note: if args.length < arity, it will process undefined to original func
      // if > arity, it will ignore rest args
      ret = ret(argsIn.shift());
    }
    return ret;
  };
}
```

#### 偏函数

严格来说叫 ”部分定参函数“ partially applied function，偏主要继承自数学传统的神秘翻译……

```js
function mul(a, b) {
  return a * b;
}
let double = mul.bind(null, 2);
console.log(double(3)); // = mul(2, 3) = 6

// 更通用的(绑定时跳过this)
function partial(func, ...argsBound) {
  return (...args) => func(...argsBound, ...args);
}
let double = partial(mul, 2);
console.log(double(3)); // = mul(2, 3) = 6

function partialRight(func, ...argsRight) {
  return (...args) => func(...args, ...argsRight);
}
// for object bag
function partialProps(fn, presetArgsObj) {
  return (laterArgsObj) => fn(Object.assign({}, presetArgsObj, laterArgsObj));
}
```
