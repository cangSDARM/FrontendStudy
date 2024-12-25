- [Trivia](#trivia)
  - [Cache 策略](#cache-策略)
  - [文件格式](#文件格式)
  - [错误处理](#错误处理)
- [ESM 2 CJS](#esm-2-cjs)

## Trivia

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

## ESM 2 CJS

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
