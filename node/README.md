- [fs](./fs.md)
- [multi thread](./multi_thread.md)
- [path](./path.md)
- [require](./cjs-require.md)

### 检测是否是 entry-point

```js
if (require.main === module) {
  // Main CommonJS module
}

import * as url from 'node:url';
if (import.meta.url.startsWith('file:')) { // (A)
  const modulePath = url.fileURLToPath(import.meta.url);
  if (process.argv[1] === modulePath) { // (B)
    // Main ESM module
  }
}
```
