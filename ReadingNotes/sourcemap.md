- [格式](#格式)
- [生成](#生成)
  - [列表](#列表)
  - [压缩列表](#压缩列表)
  - [转为字符串](#转为字符串)
  - [Base64 VLQ 压缩](#base64-vlq-压缩)
    - [VLQ 编码](#vlq-编码)
    - [Base64](#base64)
  - [结果](#结果)

## 格式

- 2009 年，Google 推出了一个 Js 代码压缩工具 Closure Compiler 及一个附带的浏览器调试插件 Closure Inspector。这个 Inspector 就是 SourceMap 的第一版雏形
- 2010年，Google 推出了 2.0 版本，并正式确认 Source Map 的名称。此版本还确定了统一的 JSON 格式，使用 Base64 编码等
- 2011年，SourceMap Revision 3 Proposal 中，SourceMap 脱离了 Closure Compiler，成为了独立的工具。这一代使用 Base64 VLQ 编码，压缩了文件体积。这是第三版，也是现在广泛流行的，作为标准使用的版本

SourceMap 分两种形式，一种是 inline(Base64 编码的 JSON)，另一种是如下的 JSON 格式:

```json5
{
  // sourcemap 版本
  "version": 3,
  // 转换后代码的文件名
  "file": "dist.js",
  // 转换前代码的文件名
  "sources": ["src/index.js"],
  // 转换前代码的文件所在的目录，因隐私问题，现在不会包含
  "sourceRoot": ".",
  // 帮助浏览器过滤不需要关注的库的代码(sourceIndex)
  "x_google_ignoreList": [0,0],
  // 转换前代码中的变量/属性名
  "names": ["sum", "jzplp", "err", "console", "log"],
  // 转换前代码的文件内容
  "sourcesContent": [
    'const globaljz = 123;\r\nfunction fun() {\r\n  const jzplp1 = "a" + "b";\r\n  const jzplp2 = 12345;\r\n  const jzplp3 = { jz1: 1, jz2: 1221 };\r\n  try {\r\n    jzplp1();\r\n  } catch (e) {\r\n    console.log(e);\r\n    throw e;\r\n  }\r\n  console.log(jzplp1, jzplp2, jzplp3);\r\n}\r\nfun();\r\n',
  ],
  // 转换前后代码中的变量/属性名的位置关系记录 Base64 VLQ Encoded
  "mappings": "AAAA,IACE,MAAMA,EAAMC,MAAQ,EACtB,CAAE,MAAOC,GACPC,QAAQC,IAAIF;AACZ,MAAMA,CACR"
}
```

正常访问页面的时候，只请求页面相关的内容，不请求 SourceMap 文件。打开浏览器调试工具的时候，浏览器会发送 SourceMap 文件请求(Developer Resource Tab)

## 生成

### 列表

| 混淆行列号 | sources 下标 | 源代码行列号 | names 下标 |
| :--------: | :----------: | :----------: | :--------: |
|    0,10    |      0       |     1,8      |     0      |
|    0,12    |      0       |     1,14     |     1      |
|    0,27    |      0       |     2,9      |     2      |
|    0,30    |      0       |     3,2      |     3      |
|    0,38    |      0       |     3,10     |     4      |
|    0,42    |      0       |     3,14     |     2      |
|    1,6     |      0       |     4,8      |     2      |

### 压缩列表

规则: 将绝对位置转为相对位置

| 混淆行列号 | sources 下标 | 源代码行列号 | names 下标 |
| :--------: | :----------: | :----------: | :--------: |
|    0,10    |      0       |     1,8      |     0      |
|    0,2     |      0       |     0,6      |     1      |
|    0,15    |      0       |     1,-5     |     1      |
|    0,3     |      0       |     1,-7     |     1      |
|    0,8     |      0       |     0,8      |     1      |
|    0,4     |      0       |     0,4      |     -2     |
|   1,-38    |      0       |     1,-6     |     0      |

### 转为字符串

规则: 行号以`;`区分(空行保留，形如`;;`)，每条列表以`,`区分(`|`为视觉区分无意义)

`10|0|1|8|0,2|0|0|6|1,15|0|1|-5|1,3|0|1|-7|1,8|0|0|8|1,4|0|0|4|-2;-38|0|1|-6|0`

### Base64 VLQ 压缩

#### VLQ 编码

Variable Length Quantity 是一种将任意大小的数字转化为连续二进制码的一种编码方式，默认 8 位。
由于需要适配 Base64 编码，因此改为 6 位编码

```txt
第一步: 去掉符号
数字的绝对值转成二进制，然后正数在后面补 0，负数在后面补 1

3     -> 11             -> 110
-38   -> -100110        -> 1001101
4268  -> 1000010101100  -> 10000101011000

第二步: 分组
按照五个二进制位分为一组，不足五位的在前面补齐0

110            -> 00110            -> 00110
1001101        -> 10 01101         -> 00010 01101
10000101011000 -> 1000 01010 11000 -> 01000 01010 11000

第三步: 小端序
00110              -> 00110
00010 01101        -> 01101 00010
01000 01010 11000  -> 11000 01010 01000

第四步: 定界
将每一组最前面补一位：1 表示序列未结束，后面还有表示同一个数字的组；0 表示数字序列结束

00110              -> 000110
01101 00010        -> 101101 000010
11000 01010 01000  -> 111000 101010 001000
```

#### Base64

基于: `[A-Za-z0-9+/]` 的 Base64

`UACQA,EAAMC,eACLC,GACPC,QAAQC,IAAIF;tCACNA`

### 结果

`UACQA,EAAMC,eACLC,GACPC,QAAQC,IAAIF;tCACNA`
