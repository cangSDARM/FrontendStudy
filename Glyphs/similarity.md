- [相似度](#相似度)
  - [Jaccard 相似度](#jaccard-相似度)
  - [Sorensen Dice 相似度系数](#sorensen-dice-相似度系数)
  - [Pearson 相关系数](#pearson-相关系数)
  - [Levenshtein 距离](#levenshtein-距离)
  - [汉明距离](#汉明距离)
  - [余弦相似性](#余弦相似性)

## 相似度

- Jaccard/Sorensen Dice/Pearson: 适用于文章分类
- Levenshtein: 适用于文章编辑版本比较
- Hamming: 适用于计算文章 SimHash (文本搜索引擎)
- Cosine: 适用于常规文本比较 (需配合关键词，猜你想读)

### Jaccard 相似度

$J(A,B) = \frac{|A\cap B|}{|A\cup B|} = \frac{|A\cap B|}{|A|+|B|-|A\cap B|}$

```ts
function jaccardIndex(a: string, b: string): number {
  if (a == null && b == null) {
    return 1;
  }
  // 都为空相似度为 1
  if (a == null || b == null) {
    return 0;
  }
  const aChar: Set<string> = new Set(Array.from(a));
  const bChar: Set<string> = new Set(Array.from(b));
  // 交集数量
  const intersection = aChar.intersection(bChar).size;
  if (intersection == 0) return 0;
  // 并集数量
  const union = aChar.union(bChar).size;
  return intersection / union;
}
```

### Sorensen Dice 相似度系数

$s(X,Y) = \frac{2|X\cap Y|}{|X|+|Y|}$

```ts
function SorensenDiceCoefficient(a: string, b: string) {
  if (a == null && b == null) {
    return 1;
  }
  if (a == null || b == null) {
    return 0;
  }
  const aChar: Set<string> = new Set(Array.from(a));
  const bChar: Set<string> = new Set(Array.from(b));
  // 交集数量
  const intersection = aChar.intersection(bChar).size;
  if (intersection == 0) {
    return 0;
  }
  // 全集，两个集合直接加起来
  const aSize = aChar.size;
  const bSize = bChar.size;
  return (2 * intersection) / (aSize + bSize);
}
```

### Pearson 相关系数

### Levenshtein 距离

用编辑距离(两个字串之间，由一个转成另一个所需的最少编辑操作次数)表示字符串相似度, 编辑距离越小，字符串越相似

```ts
function editDistance(a: string, b: string) {
  const aLen = a.length;
  const bLen = b.length;

  if (aLen == 0) return bLen;
  if (bLen == 0) return aLen;

  const v: number[][] = [];
  for (let i = 0; i <= aLen; ++i) {
    v[i] ??= [];
    for (let j = 0; j <= bLen; ++j) {
      if (i == 0) {
        v[i][j] = j;
      } else if (j == 0) {
        v[i][j] = i;
      } else if (a.codePointAt(i - 1) == b.codePointAt(j - 1)) {
        v[i][j] = v[i - 1][j - 1];
      } else {
        v[i][j] =
          1 + Math.min(v[i - 1][j - 1], Math.min(v[i][j - 1], v[i - 1][j]));
      }
    }
  }
  return v[aLen][bLen];
}

function LevenshteinDistance(a: string, b: string) {
  if (a == null && b == null) {
    return 1;
  }
  if (a == null || b == null) {
    return 0;
  }
  const editDistance = editDistance(a, b);
  return 1 - editDistance / Math.max(a.length, b.length);
}
```

### 汉明距离

仅考虑并计算两个等长字符串中不一致的字符个数

```ts
function hammingDistance(a: string, b: string) {
  if (a == null || b == null) {
    return 0;
  }
  if (a.length != b.length) {
    return 0;
  }

  let count = 0;
  for (let i = 0; i < a.length; i++) {
    if (a.codePointAt(i) != b.codePointAt(i)) {
      count++;
    }
  }
  return count / a.length;
}
```

### 余弦相似性

$s = cos(\theta) = \frac{A\cdot B}{\lVert A\rVert\lVert B\rVert} = \frac{\underset{i=1}{\overset{n}{\sum}}A_i\times B_i}{\sqrt{\underset{i=1}{\overset{n}{\sum}}(A_i)^2}\times\sqrt{\underset{i=1}{\overset{n}{\sum}}(B_i)^2}}$

```ts
function cosineSimilarity(a: string, b: string) {
  if (a == null || b == null) {
    return 0;
  }

  const aChar: Set<string> = new Set(Array.from(a));
  const bChar: Set<string> = new Set(Array.from(b));

  // 统计字频
  const aMap = new Map<string, number>();
  const bMap = new Map<string, number>();
  for (const a1 of aChar) {
    aMap.set(a1, (aMap.get(a1) ?? 0) + 1);
  }
  for (const b1 of bChar) {
    bMap.set(b1, (bMap.get(b1) ?? 0) + 1);
  }

  // 向量化
  const union = new Set(aChar).union(bChar);
  const aVec = Array.from<number>({ length: union.size });
  const bVec = Array.from<number>({ length: union.size });
  const collect = Array.from(union);
  for (let i = 0; i < collect.length; i++) {
    aVec[i] = aMap.get(collect[i]) ?? 0;
    bVec[i] = bMap.get(collect[i]) ?? 0;
  }

  // 分别计算三个参数
  let p1 = 0;
  for (let i = 0; i < aVec.length; i++) {
    p1 += aVec[i] * bVec[i];
  }

  let p2 = 0;
  for (const i of aVec) {
    p2 += i * i;
  }
  p2 = Math.sqrt(p2);

  let p3 = 0;
  for (const i of bVec) {
    p3 += i * i;
  }
  p3 = Math.sqrt(p3);

  return p1 / (p2 * p3);
}
```
