# Dependency Injection

实现控制反转（Inversion of Control，下文称 IoC）最常见的技术手段之一

在程序运行过程中，客户类不直接实例化具体服务类实例，而是客户类的运行上下文环境或专门组件负责实例化服务类，然后将其注入到客户类中，保证客户类的正常运行

## Setter 注入

- 在被注入类(客户类)中，包含：
  - 一个注入类(服务类)类型的成员属性
  - 一个作为注入点的方法
  - 多个使用到该服务类的函数

```typescript
const serviceA: IService = new Service();
const serviceB: IService = new Service();
const client: Client = new Client();

client.Set_ServiceImpl(serviceA);
client.ShowInfo();
client.Set_ServiceImpl(serviceB);
client.ShowInfo();
```

## 构造注入

与 Setter 注入很类似，只是注入点由 Setter 方法变成了构造方法

```typescript
const serviceA: IService = new Service();
const client: Client = new Client(serviceA);
client.ShowInfo();
```

## 依赖获取 Service Locator

- 客户类仍然依赖服务类的接口
- 在系统中提供一个获取点(factory/reflector)：
  - 当客户类需要服务类时，从获取点主动取得指定的服务类，具体的服务类类型由获取点的配置决定。
- 该方法变被动为主动，使得客户类在需要时主动获取服务类，而将多态性的实现封装到获取点里面。是**最常见的 DI 实现**

> 不论使用 Simple Factory 还是 Abstract Factory，都避免不了需要有一个地方存在不符合 OCP 的 if…else 或 switch…case 结构来判断服务类类型或工厂类型。
> 这种缺陷是 Simple Factory 和 Abstract Factory 本身无法消除的，需要通过将反射机制的引入解决这个问题

```typescript
class Factory {
  service: Service;

  getService(type: string) {
    // defect
  }
}
class Client {
  ShowInfo() {
    const s = this.factory.getService("active");
    s.xx();
  }
}

const serviceA: IService = new Service();
const factory = new Factory(serviceA);
const client = new Client(factory);
client.ShowInfo();
```

## 习题

<details>
<summary>
在 JS 中的 DI 是怎么样的？
</summary>

```typescript
// 基于 toString
class Injector {
  _cache = {};
  put(name, obj) {
    this._cache[name] = obj;
  }
  getParamNames(func) {
    // 正则表达式出自http://krasimirtsonev.com/blog/article/Dependency-injection-in-JavaScript
    var paramNames = func
      .toString()
      .match(/^function\s*[^\(]*\(\s*([^\)]*)\)/m)[1];
    paramNames = paramNames.replace(/ /g, "");
    paramNames = paramNames.split(",");
    return paramNames;
  }
  resolve(func, bind) {
    var self = this;
    var paramNames = self.getParamNames(func);
    var params = paramNames.map(function (name) {
      return self._cache[name];
    });
    func.apply(bind, params);
  }
}
var injector = new Injector();
var client = new Student();
injector.put("notebook", new Notebook());
injector.put("pencil", new Pencil());
injector.resolve(client.write, client);

// 基于装饰器和反射
var dependenciesMap = {};
var injector = {
  get: function (target) {
    var constructor = dependenciesMap[target.name];
    return new constructor();
  },
};
function Injectable() {
  return function (constructor) {
    constructor.injectable = true;
    dependenciesMap.set(constructor.name, constructor);
    return constructor;
  };
}
@Injectable()
class Service {}
@Inject(Notebook, Pencil)
class Client {
  constructor(injector: Inject) {
    this.service = injector.get(Service);
  }
}

// https://inversify.io/
// https://github.com/mgechev/injection-js
```

</details>

## 参见

- 用 OO 就不可能不用多态性，用多态性就不可能不用依赖注入，所以，依赖注入变成了非常频繁的需求。专门用于实现依赖注入功能的组件或框架，就是 IoC Container
