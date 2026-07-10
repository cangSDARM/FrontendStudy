// 装饰器
namespace Decorator {
  //装饰器工厂(传参)
  function logF(params: any) {
    //装饰器需要的参数
    //返回装饰器
    return function (
      target: any,
      propertyKey: string,
      descriptor: PropertyDescriptor,
    ) {
      console.log("f(): called");
    };
  }

  /**
   * 类装饰器
   * @param target 类装饰器只有target
   * @returns 返回的值会覆盖原有的target
   */
  function dec(target: any) {
    return class extends target {
      property: "new property";
    };
  }
  function logc(target: any) {}

  /**
   * 属性装饰器 - 只能用来监听属性, 无法修改属性对象
   * @param target 对于静态成员和类来说是类的构造函数, 对于实例成员是类的原型(prototype)对象
   * @param propertyKey 属性的名字
   */
  function logp(target: any, propertyKey: string | symbol) {}

  /**
   * 方法装饰器
   * @param target 对于静态成员和类来说是类的构造函数, 对于实例成员是类的原型(prototype)对象
   * @param propertyKey 方法的名字
   * @param descriptor 成员的属性描述符(value/emuatable/configurable/writable, 且ES5以下没有)
   * @returns 如果返回则返回新的 descriptor
   */
  function logf(
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) {}

  /**
   * 参数装饰器 - 只能用来监视一个方法的参数是否被传入, 其返回值会被忽略
   * @param target target和方法装饰器相同
   * @param argName 方法名字
   * @param agrIndex 第三个参数变为: 参数在函数参数列表中的索引
   */
  function decc(target: new () => any, argName: string, agrIndex: number) {}

  /**
   * 访问器装饰器 - 和方法装饰器相同, 但处理的是getter/setter
   * 不能同时给同名的getter/setter设置访问器
   * @param target target和方法装饰器相同
   * @param argName argName和方法装饰器相同
   * @param descriptor 成员的属性描述符(value/emuatable/configurable/writable, 且ES5以下没有)
   * @returns 如果返回则返回新的 descriptor
   */
  function decd(
    target: any,
    argName: string,
    descriptor: TypedPropertyDescriptor<string>,
  ) {
    return {
      get: () => "B", //rewrite getter
      set: (name: string) => (target.name = name), //rewrite setter
      enumtable: true,
    };
  }

  @logc
  @dec //当复合log和dec时，复合的结果(log ∘ dec)(A)等同于log(dec(A))
  class A {
    @logp
    public _name;

    constructor() {}

    @logf
    @logF("params")
    public func(@decc arg: any) {}

    @decd
    get name() {
      return "A";
    }
  }
}
