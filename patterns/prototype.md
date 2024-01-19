# Prototype pattern

一个对象可以产出与它自己相近的对象，允许 clone

## 例子

从怪物生成角度考虑，生成不同的怪物

```typescript
class Monster {
  private health: number;
  private speed: number;

  clone(): Monster {
    return new Monster();
  }
}
class Spawner<T extends Monster> {
  private monster: T;

  spawn(): T {
    monster.clone();
  }
}

// using
const Ghoul = new GhoulMonster();
const GhoulSpawner = new Spawner<Ghoul>();
GhoulSpawner.spawn();
```

## 习题

<details>
<summary>

如何以这种模式实现 oop？

> OOP 让你定义“对象”，将数据和代码绑定在一起
> 类只是其中一种实现它的方法，类只是让你能够快速生成对象
> 而原型模式正好可以对应类的功能，所以原型也能实现 OOP
> 有一个经典案例: [Self Lang](<https://en.wikipedia.org/wiki/Self_(programming_language)>)

</summary>

```typescript
// 模拟代码，并没有完全实现 oop
const Object = {
  parentProperty: "object",
};
const ParentObj = {
  selfProperty: "self",
  clone() {
    return ParentObj;
  },
};
ParentObj.prototype = Object;

const ChildObj = { childProperty: "child" };
ChildObj.prototype = Parent;

ChildObj.clone(); // resolve from ChildObj.prototype as is ParentObj
console.log(ChildObj.parentProperty); // resolve from ChildObj.prototype.prototype as is Object
```

</details>

## 参见

- 在例子中，我们为每种地形都创建了一个实例然后存储在 World 中。但在多数情况下，不会在一开始就创建所有享元。如果你不能预料哪些是实际上需要的，最好在*需要时才创建*。为了保持共享的优势，当你需要一个时，首先看看是否已经创建了一个相同的实例。如果确实如此，那么只需返回那个实例。像这样隐藏构造指令是*工厂方法*的一个例子。
- 为了返回一个早先创建的享元，需要追踪那些已经实例化的对象池。正如其名，这意味着*对象池*是存储它们的好地方。
- 当使用*状态模式*时，经常会出现一些没有任何特定字段的"状态对象"。其状态的标识和方法都很有用。在这种情况下，可以使用享元模式，然后在不同的状态机上使用相同的对象实例。
