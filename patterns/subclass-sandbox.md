# Subclass-sandbox pattern

用一系列由基类提供的操作定义子类中的行为, 让复杂的子类只耦合基类

何时使用:

- 有很多的子类但是继承链不深
- 子类的扩展性非常大
- 在子类间有行为重复
- 想要最小化子类和程序的其他部分的耦合

## 问题

```ts
// 基类很难再修改(brittle base class problem)
// 抽离部分功能到其他辅助类
class SoundPlayer {}
class Base {
  getSoundPlayer(): SoundPlayer {}
}

// 基类不好注入状态
// 1. 传给构造器(缺点, 子类声明时就会接触到相关状态)
class Base {
  constructor(private particle: ParticleSystem) {}
}
// 2. 二次实例化(缺点, 需要工厂函数来实例化, 否则很容易忘记)
class Base {
  constructor() {}
  init(particle: ParticleSystem) {}
}
// 3. 静态单例状态(缺点, 后期耦合高)
class Base {
  static initParticle(particle: ParticleSystem) {}
}
// 4. 状态由外部静态, 基类寻找对应的单例(使用 服务定位器模式)
class Base {
  getParticle() {
    const particle: ParticleSystem = Locator.getParticleSystem();
  }
}
```

## 参见

- 这个模式与模板方法正相反。子类沙箱中，方法在子类，受限操作在基类。模板方法中，基类有方法，而受限操作在子类中
- 也可以认为这个模式是外观模式的变形。外观模式将一系列不同系统藏在简化的API后。使用子类沙箱，基类起到了在子类前隐藏整个API的作用
