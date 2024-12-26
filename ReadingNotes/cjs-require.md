- [Trivia](#trivia)
  - [载入策略](#载入策略)
  - [Cache 策略](#cache-策略)
  - [文件格式](#文件格式)
  - [错误处理](#错误处理)
- [高级处理](#高级处理)
  - [ESM 2 CJS](#esm-2-cjs)
  - [Avoid cache control](#avoid-cache-control)

## Trivia

### 载入策略

加载文件模块的工作，主要由原生模块 module 来实现和完成，该原生模块在启动时已经被加载

每个 cjs 模块文件中，都有个关键的 module 对象，继承自 Module 是这个模块对象自身

当调用 require 时:

- The name argument to `require(name)` is mapped to the full filename using `Module._resolveFilename(name, this);` method.
- If `cache[fullName]` exists, then `cache[fullName].exports` is returned (Because a module can only be loaded once). You can `delete cache[fullName]` yourself before calling `require(name)` to bust cache.
- Otherwise, the source from `fullName` is loaded, and the corresponding callback is run to preprocess the source, see `Module.prototype.load`.
- Finally, the transformed source is compiled (evaluated) and the `module.exports` value is returned to the user, see `Module.prototype._compile`.

```js
var Module = require("module");
console.log(Module.wrapper);
// [ '(function (exports, require, module, __filename, __dirname) { ',
//   '\n});' ]

Module.prototype._compile = function (content, filename) {
  var self = this;
  function require(path) {
    return self.require(path);
  }
  // ...
  var wrapper = Module.wrap(content);
  var compiledWrapper = runInThisContext(wrapper, { filename: filename });
  var args = [self.exports, require, self, filename, dirname];
  return compiledWrapper.apply(self.exports, args);
};
```

### Cache 策略

require 采取了非常激进的**单例 cache** 策略。
这意味着模块只执行和计算一次，所有未来调用都引用初始模块导出对象

包括内置模块

```js
// test.js
console.log("Loaded");
module.exports = { foo: "bar" };
// main.js
require("test.js"); // print loaded
require("test.js"); // non print, 因为已经有单例被require过了
require("test.js"); // non print, same above

require("fs") === require("fs"); // 内置模块也是单例，无论require多少次
```

### 文件格式

require (以及 import) 可以**导入任何文件**，以二进制形式

```js
const logo = require("./logo.png"); // Buffer
const styles = require("./styles.css"); // string
```

### 错误处理

require 出错会直接抛错，所以直接 try-catch 即可

## 高级处理

### ESM 2 CJS

```ts
const esm = require("esm");
const fs = require("fs");
const Module = require("module");

// Node: bypass [ERR_REQUIRE_ESM]
const orig = Module._extensions[".js"];
Module._extensions[".js"] = function (module, filename) {
  try {
    return orig(module, filename);
  } catch (e) {
    // if (e.code === 'ERR_REQUIRE_ESM') { <-- I comment this because in my system this error is not throw.
    const content = fs.readFileSync(filename, "utf8");
    module._compile(content, filename);
    // }
  }
};

const _esmRequire = esm(module, {
  cjs: true,
  mode: "all",
});

// don't pollute Module
Module._extensions[".js"] = orig;

module.exports = function esmRequire(id) {
  return _esmRequire(id);
};
```

### Avoid cache control

```js
function reacquire(module) {
  const fullpath = require.resolve(module);
  const backup = require.cache[fullpath];
  delete require.cache[fullpath];

  try {
    const newcopy = require(module);
    console.log("reqcquired:", module, typeof newcopy);
    return newcopy;
  } catch (e) {
    console.log("Can't reqcquire", module, ":", e.message);
    require.cache[fullpath] = backup;
    return backup;
  }
}
```
