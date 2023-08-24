const randInRange = (min: number, max: number) =>
  Math.random() * (max - min) + min;

const randPercent = (r: number, bis = 0.2) => r * randInRange(1 - bis, 1 + bis);

const round = (r: number) => Math.round(r);

const clamp = (num: number, min: number, max: number) =>
  Math.min(Math.max(num, min), max);

const bruteShuffle = <T>(list: T[]) => list.sort(() => Math.random() - 0.5);

// https://keyj.emphy.de/balanced-shuffle/
function balanceShuffle<T, Emp = undefined>(
  arr: T[][],
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
      result.push(...bruteShuffle(waitShuffle));
      waitShuffle = [];
    }

    return result;
  }

  const sparseLen = Math.max(...arr.map((track) => track.length));
  return merge(
    arr.map((track) => toSparse(sparseLen, track, emptied)),
    sparseLen,
    emptied,
  );
}
