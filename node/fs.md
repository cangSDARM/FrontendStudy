- [检查入口文件](#检查入口文件)
- [文本读取](#文本读取)

<br/>
- "l"开头的函数通常操作符号链接: `fs.lchmodSync`
- "f"开头的函数通常管理文件描述符: `fs.fstatSync`

### 检查入口文件

```js
// CJS
if (require.main === module) {
  // Main CommonJS module
}

// ESM
if (import.meta.url.startsWith("file:")) {
  // (A)
  // 如果我们确信我们的代码总是在本地运行，我们可以省略 A 中的检查
  const modulePath = url.fileURLToPath(import.meta.url);
  if (process.argv[1] === modulePath) {
    // (B)
    // Main ESM module
  }
}
```

### 文本读取

```js
// 将字符串按行分割
const RE_SPLIT_AFTER_EOL = /(?<=\r?\n)/;
function splitLinesWithEols(str) {
  return str.split(RE_SPLIT_AFTER_EOL);
}
```
