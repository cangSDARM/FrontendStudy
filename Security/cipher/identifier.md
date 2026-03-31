- [UUID](#uuid)
  - [UUIDv4](#uuidv4)
  - [UUIDv7](#uuidv7)
  - [GUID](#guid)
  - [ULID](#ulid)
- [Snowflake](#snowflake)
- [ShortURL](#shorturl)

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

### GUID

特指微软对 UUID 标准的实现

### ULID

Universally Unique Lexicographically Sortable Identifier, 民间提案

其好处在于, 可排序, 并且单调递增

共 128bit, 有 48 bit 时间戳(毫秒级)和 80 bit 随机值

表示为 [Crockford 编码的 BASE64](https://www.crockford.com/base32.html) 字符串

```
0GWWXY2G84DFMRVWQNJ1SRYCMC
```

ULID 的单调性由算法保证。在同一毫秒内生成的将是单调递增的

## Snowflake

和 UUIDv7 类似，但不是随机的

共 64 bit，全局唯一且趋势递增(不是严格单调递增)

```
符号位      worker id, 10 bit, 对应每台机器分配一个 id(最大1024)
  |         |
  0 129012 1f 129408242424424
     |                     |
  时间戳(毫秒), 41 bit    序列号, 12 bit, 保证在同一亚秒内(此时是毫秒)生成的 uuid 也是唯一的(递增++)
```

```java
public synchronized long generate() {
  long currentMill = timeService.getCurrentMills();
  if (waitToTolerateTimeDifferenceIfNeed(currentMill)) {  // 保证多机器的时间递增(否则等待几毫秒)
    currentMill = timeService.getCurrentMills();
  }
  if (lastMill == currentMill) {
    sequence = sequence = (sequence + 1) & SEQUENCE_MASK; // sequence 生成(超过 12bit 回 0)
    if (0L == sequence) {
      currentMill = waitUtilNetTime(currentMill);
    }
  } else {
    vibrateSequenceOffset(MAX_SEQUENCE_OFFSET);
    // sequence 震荡 生成 0 1 2 ..MAX_SEQUENCE_OFFSET 0 1 2..MAX_SEQUENCE_OFFSET
    sequence = sequenceOffset; // 保证 在 id % MAX_SEQUENCE_OFFSET 的时候，不会一直生成 0
  }
  lastMill = currentMill;

  currentMill = (currentMill - EPOCH); // 减去需要的时间起点，不然 long 的 塞不进 41 bit (最长工作69年)
  return currentMill << TIMESTAMP_SHIFT_BITS | getWorkerId() << WORKER_SHIFT_BITS | sequence;
}
```

## ShortURL

1. 长 URL 通过唯一 id 生成器，生成唯一*数字 ID*
2. 通过 Base62 (只包含 0-9,a-z,A-Z) 映射为短 URL

> 因此短 URL 的长度通常无法固定
