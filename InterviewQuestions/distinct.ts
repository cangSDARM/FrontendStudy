// object properties never reduplicate
// (If it's all nunmerical, use `new Set([...a, ...b])`, also been fastest)
function distinct3<T extends any[], U extends any[]>(
  base: T[],
  count: U[]
): T[] {
  const arr = base.concat(...count);
  const result: T[] = [];
  const obj: Record<string, number> = {};
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
