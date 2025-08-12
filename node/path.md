- [解析](#解析)
- [规范化](#规范化)
- [连接路径](#连接路径)
- [Glob](#glob)
- [AppRootPath](#approotpath)

### 解析

node 中文件的扩展名是包含（ . ）的

```txt
unix:
  /      home/jane / file   .txt
| root |           | name | ext  |
| dir              | base        |

Win32:
  C:\    Users\john \ file   .txt
| root |            | name | ext  |
| dir               | base        |
```

### 规范化

`path.normalize(path: string): string`

- 移除单个点（ . ）的路径段
- 解析双点路径段（ .. ）
- (Win32 Only)将每个合法的路径分隔符斜杠（ / ）转换为首选路径分隔符（ \\ ）
- 将多个路径分隔符转换为单个路径分隔符

```js
path.win32.normalize("C:\\Users/jane\\doc\\..\\proj\\\\src"); // "C:\\Users\\jane\\proj\\src"
path.win32.normalize(".\\jane\\doc\\..\\proj\\\\src"); // 'jane\\proj\\src'
```

> path.isAbsolute 不会自动规范化

### 连接路径

有两个函数用于连接路径：

- `path.resolve()` 总是返回完全限定的路径
  - 默认从当前工作目录开始
  - 任何完全限定的路径都会替换之前的结果
- `path.join()` 返回保留相对路径
  - 依据第一个参数：如果是完全限定则结果是完全限定；否则是相对
  - 即使后面的参数是完全限定路径，它们也将被解释为相对路径

```js
// cwd = /home/xxx
path.resolve("bin"); // /home/xxx/bin
path.resolve("bin", "/home", "john"); // /home/john
path.resolve("bin", "/home", "john", "proj", "../src"); // /home/join/src

path.posix.join("/usr/local", "sub", "subsub"); // '/usr/local/sub/subsub'
path.posix.join("relative/dir", "sub", "subsub"); // "relative/dir/sub/subsub"
path.win32.join("dir", "C:\\Users"); // 'dir\\C:\\Users'
```

### Glob

- 没有通配符的必须精确匹配。包括路径分隔符
  - `minimatch('/dir/file.txt', 'dir/file.txt') // false`
- 通配符星号（ \* ）匹配任何路径段或段的一部分
  - `minimatch('/tmp/file.txt', '/*/file.txt') // true`
  - `minimatch('/dir/file.txt', '/dir/*.txt') // true`
  - 星号与“点文件”不匹配。如果我们想要匹配这些，我们必须在星号前面加上一个点
    - `minimatch('.gitignore', '*') // false`
    - `minimatch('/tmp/.log/events.txt', '/tmp/*/events.txt') // false`
    - `minimatch('.gitignore', '.*') // true`
- 双星号（ \*\* ）匹配零个或多个段
  - `minimatch('/file.txt', '/**/file.txt') // true`
  - `minimatch('/dir/sub/file.txt', '/**/file.txt') // true`
  - 双星号和星号一样，不匹配“点文件”路径段
    - `minimatch('/usr/local/.tmp/data.json', '/usr/**/data.json') // false`
- 感叹号（ ! ）否定匹配
  - `minimatch('file.txt', '!**/*.txt') // false`
  - `minimatch('file.js', '!**/*.txt') // true`
- 括号（ {} ）模式匹配
  - `minimatch('file.txt', 'file.{txt,js}') // true`
  - 整数范围匹配
    - `minimatch('file3.txt', 'file{1..3}.txt') // true`
    - 零开头的不会自动去零
      - `minimatch('file1.txt', 'file{01..12}.txt') // false`
      - `minimatch('file01.txt', 'file{01..12}.txt') // true`

### AppRootPath

```ts
let rootPathCache: string | undefined;
/** a fixer for as local dependency */
export const fromAppRootPath = !rootPathCache
  ? (filename: string = "") => {
      // https://segmentfault.com/q/1010000007564141
      const localDir = path.resolve(
        __dirname.replace(/(.*)dist(.*)/giu, "$1dist"),
        ".."
      );
      const remoteDir = require("app-root-path").path;
      const projectDir = process.env.INIT_CWD; // 使用 INIT_CWD 是为了防止本地调用 npm 文件路径 bug

      // 判断当前环境调用者是否在本地，是就用 projectDir，否则使用 remoteDir
      rootPathCache =
        remoteDir === localDir
          ? path.join(projectDir, filename)
          : path.join(remoteDir, filename);

      return rootPathCache;
    }
  : (filename = "") => path.join(rootPathCache, filename);
```
