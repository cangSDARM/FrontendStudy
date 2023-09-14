const randInRange = (min: number, max: number) =>
  Math.random() * (max - min) + min;

const randPercent = (r: number, bis = 0.2) => r * randInRange(1 - bis, 1 + bis);

const round = (r: number) => Math.round(r);

const clamp = (num: number, min: number, max: number) =>
  Math.min(Math.max(num, min), max);

// 仅shuffle前后的内容
const bruteShuffle = <T>(list: T[]) => list.sort(() => Math.random() - 0.5);

// https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
// 简单的shuffle算法
// 可能性空间：依赖于内部的随机数长度 2^32
// 完全均匀的随机：否。由于浮点数舍入
function fisherYatesShuffle<T>(arr: T[]) {
  const input = [...arr];

  for (let i = input.length - 1; i >= 0; i--) {
    // 为 randInRange(0, i) 则是 Sattolo's Shuffle。会缩小为 (n-1)! 种排列
    let randomIndex = Math.floor(randInRange(0, i + 1));
    let itemAtIndex = input[randomIndex];

    input[randomIndex] = input[i];
    input[i] = itemAtIndex;
  }
  return input;
}

// https://keyj.emphy.de/balanced-shuffle/
// 多个数组内容“均匀分布”的算法，用于歌曲随机
function balanceShuffle<T, Emp = undefined>(
  grouped: T[][],
  // @ts-ignore: ts error
  emptied: Emp = undefined,
) {
  // the fill algorithm
  function toSparse<T, Emp = undefined>(
    len: number,
    original: T[],
    // @ts-ignore: ts error
    emptied: Emp = undefined,
  ) {
    const copy = [...original];
    if (original.length >= len) return copy;

    const segment = (n: number, k: number) =>
      +k < Number.EPSILON + 0 ? 0 : n / k;

    const stride = (n: number, k: number) =>
      clamp(round(randPercent(segment(n, k), 0.2)), 1, n - k + 1);

    const arr: (T | typeof emptied)[] = new Array(len).fill(emptied);
    let restLen = len,
      pos = 0,
      step = 0;
    while (pos < len) {
      step = stride(restLen, copy.length);
      arr[pos] = copy.shift() || emptied;
      pos += step;
      restLen -= step;
    }
    // random pending to beginning
    const pending = clamp(round(randInRange(0, step)), 0, step);
    for (let i = 0; i < pending; i++) {
      if (arr[arr.length - 1 - i] !== emptied) break;
      arr.unshift(emptied);
    }
    arr.length = len;

    return arr;
  }
  // the merge algorithm
  function merge<T, Emp = undefined>(
    arr: (T | Emp)[][],
    len: number,
    // @ts-ignore: ts error
    emptied: Emp = undefined,
  ) {
    const result: T[] = [];
    let waitShuffle: T[] = [],
      curSong: T | Emp = emptied;
    for (let i = 0; i < len; i++) {
      arr.forEach((track) => {
        curSong = track[i];
        if (curSong === emptied) return;
        // @ts-ignore
        waitShuffle.push(curSong);
      });
      result.push(...fisherYatesShuffle(waitShuffle));
      waitShuffle = [];
    }

    return result;
  }

  const sparseLen = Math.max(...grouped.map((track) => track.length));
  return merge(
    grouped.map((track) => toSparse(sparseLen, track, emptied)),
    sparseLen,
    emptied,
  );
}

// https://engineering.atspotify.com/2014/02/how-to-shuffle-songs/
// 是 balanceShuffle 的改进
function spotifyShuffle<T, Emp = undefined>(
  grouped: T[][],
  // @ts-ignore: ts error
  emptied: Emp = undefined,
) {

  // fake code!!
  function toSparse<T, Emp = undefined>(
    len: number,
    original: T[],
    // @ts-ignore: ts error
    emptied: Emp = undefined,
  ) {
    // 改进：提前预测每次步进数，循环时仅添加偏移量
    const stride = round(len * (1 / original.length));
    // 改进：pending 提前算
    const pending = randInRange(0, round(len - stride * original.length) - 1);
    // 改进：内部的数组也会被打乱一次
    const copy = fisherYatesShuffle(original);

    const arr: (T | typeof emptied)[] = new Array(len).fill(emptied);
    
    let step = pending, i = 0;
    while(step < arr.length) {
      step = stride + randInRange(-1, 1);
      arr[step] = copy[i];
      i++;
    }

    return arr;
  }

  // same as balanceShuffle
  function merge<T, Emp = undefined>(
    arr: (T | Emp)[][],
    len: number,
    // @ts-ignore: ts error
    emptied: Emp = undefined,
  ){
    return arr.flat();
  }
  
  const sparseLen = Math.max(...grouped.map((track) => track.length));
  return merge(
    grouped.map((track) => toSparse(sparseLen, track, emptied)),
    sparseLen,
    emptied,
  );
}

// https://ruudvanasseldonk.com/2023/an-algorithm-for-shuffling-playlists
// 另一种歌曲随机的算法。
// 优点：单个分类最小连续；缺点：输入一致时随机性不强
// rust: https://github.com/ruuda/musium/blob/master/src/shuffle.rs
