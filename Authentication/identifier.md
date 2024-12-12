- [UUID](#uuid)
  - [UUIDv4](#uuidv4)
  - [UUIDv7](#uuidv7)
  - [ULID](#ulid)

## UUID

- v1: 需要知道计算机的 MAC 地址
- v2: 只能保证如果大约每 7 分钟生成一个, 则是唯一
- v3, v5: 基于输入生成, 是可预测的

### UUIDv4

由随机的 122bit 和固定的 6bit (版本/变体标识)组成

```
                variant, 固定前两个 bit 为 10, 因此其值可以是 8(1000), 9(1001), a(1010), 或者 b(1011)
                   |
571f55ff-97a2-4f86-81b5-9074c57b3687
              |
            version, 由 4bit 表示, 并且固定为 4
```

### UUIDv7

[草案阶段](https://datatracker.ietf.org/doc/html/draft-peabody-dispatch-new-uuid-format#name-uuid-version-7)

共 128bit。基于对应输入(时间精度)有不同的表示。时间越精确, 随机的 bit 就越少

毫秒精度设置下, 有 48bit 的时间戳, 6bit 版本/变体, 12 bit 单调序列, 和 62 bit 的随机

v7 的好处在于, 他是单调递增的。可以做索引和排序

```
            version, 由 4bit 表示, 并且固定为 7
              |
              | variant, 固定前两个 bit 为 10, 因此其值可以是 8(1000), 9(1001), a(1010), 或者 b(1011)
              |    |
571f55ff-97a2-7000-81b5-9074c57b3687
|||||||| ||||  |||
|||||||| ||||   |
||||||   |||   monotonic, 12bit, 保证在同一亚秒内(此时是毫秒)生成的 uuid 也是唯一的(递增++)
||||      |
|||     后 N bit 是可变数量的亚秒级精度(毫秒下是 12bit)
 |
前 36bit 固定为对应的的时间戳(精度为秒)
```

### ULID

Universally Unique Lexicographically Sortable Identifier, 民间提案

其好处在于, 可排序, 并且单调递增

共 128bit, 有 48 bit 时间戳(毫秒级)和 80 bit 随机值

表示为 [Crockford 编码的 BASE64](https://www.crockford.com/base32.html) 字符串

```
0GWWXY2G84DFMRVWQNJ1SRYCMC
```

ULID 的单调性由算法保证。在同一毫秒内生成的将是单调递增的
