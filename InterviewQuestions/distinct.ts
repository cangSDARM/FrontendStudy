// https://www.cnblogs.com/wisewrong/p/9642264.html

// first: concat to one-array
function distinct<T extends any[], U extends any[]>(
  base: T[],
  count: U[]
): T[] {
  return base
    .concat(...count)
    .filter((i, _, arr) => arr.indexOf(i) === arr.lastIndexOf(i));
}

// second: 1st optimized sort and compare
function distinct2<T extends any[], U extends any[]>(
  base: T[],
  count: U[]
): T[] {
  let arr = base.concat(...count);
  arr = arr.sort();
  let result = [arr[0]];

  for (let i = 1, len = arr.length; i < len; i++) {
    arr[i] !== arr[i - 1] && result.push(arr[i]);
  }
  return result;
}

// third: object properties never reduplicate
// fastest. (If it's all nunmerical, use `new Set([...a, ...b])`, also been fastest)
function distinct3<T extends any[], U extends any[]>(
  base: T[],
  count: U[]
): T[] {
  let arr = base.concat(...count);
  let result = [];
  let obj = {};
  let iStr = "";
  for (let i of arr) {
    iStr = i.toString();
    if (!obj[iStr]) {
      result.push(i);
      obj[iStr] = 1;
    }
  }

  return result;
}
