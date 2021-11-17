type Item = {
  id: string | number;
  children?: Item[];
  name: string;
  pid: string | number;
};

function listToTree(list: Item[]) {
  return list.filter((e) => {
    let pid = e.pid;
    let newArr = list.filter((ele) => {
      if (ele.id == pid) {
        if (!ele.children) {
          ele.children = [];
        }
        ele.children.push(e);
        return true;
      }
    });
    return newArr.length === 0;
  });
}

listToTree([
  { id: 1, name: "一级 1", pid: 0 },
  { id: 2, name: "二级 1-1", pid: 1 },
  { id: 3, name: "二级 1-2", pid: 1 },
  { id: 4, name: "三级 1-1-1", pid: 2 },
  { id: 5, name: "一级 2", pid: 0 },
]);
