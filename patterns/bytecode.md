# Bytecode pattern

将行为封装为简单的"指令集合", 是解释器模式的升级版

简而言之就是实现一个领域特定语言(DSL)的编译器

常用的有两种

- 基于寄存器的虚拟机
- 栈式虚拟机

## Interpreter 解释器模式

用于执行语法树, 将树中的每个对象拆解为表达式的类/类集合

对于庞大的语法树, 解析器模式过于缓慢

```ts
abstract class Expression {
  abstract evaluate(): number;
}

class NumberExpression extends Expression {
  constructor(private value: number) {
    super();
  }

  evaluate(): number {
    return this.value;
  }
}

class AdditionExpression extends Expression {
  constructor(
    private left: Expression,
    private right: Expression,
  ) {
    super();
  }

  evaluate(): number {
    return this.left.evaluate() + this.right.evaluate();
  }
}
```
