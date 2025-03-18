import React from "react";
import Lo from "lodash";

type DataItem<Data> = Data & {
  childrenIds?: string[];
  parentIds: string[];
  id: string;
};
type DataMap<Key, Data> = Map<Key, DataItem<Data>>;

const getDescendantsById = <Data>(opts: {
  id: string;
  map: DataMap<string, Data>;
  allChildren?: boolean;
}) => {
  const { map, id, allChildren = true } = opts;
  const data = map.get(id);

  if (!data?.childrenIds || !Array.isArray(data.childrenIds)) return [];

  const descendants: DataItem<Data>[] = [];
  const candidates = [...data.childrenIds];

  let cid: string | undefined = undefined,
    child: DataItem<Data> | undefined = undefined;
  while (true) {
    cid = candidates.shift();
    if (!cid) break;
    child = map.get(cid);

    if (!child) continue;
    descendants.push(child);
    // @ts-ignore we already checked before
    if (allChildren) candidates.push(...child.childrenIds);
  }

  return descendants;
};

type Childable<T = any> = T & { children?: any; child?: any };

/**
 * manage tree data as a flatten list / map
 *
 * - parent will hold all children by `childrenIds`
 * - child will hold all ancestor by `parentIds` (nearest is last)
 * 
 * @example
 * ```ts
  const dataMap = useTreeMap<{ title: string }>();

  dataMap.add(item.id, { title: item.name }, item.parentId);
  dataMap.del('del_one_id');
  dataMap.update('update_one_id', updates);
  dataMap.get('id');
  
  dataMap.data; //just a simple map
  dataMap.data.values();
  dataMap.data.keys();

 * ```
 * 
 * @param manual set true if you need manually update. and call the `dataMap.synchro()` after add/del/update operation
 * @returns
 */
export const useTreeMap = <Data>(manual = false) => {
  const dataMapRef = React.useRef(new Map<string, DataItem<Data>>());
  const [__, syncUpdate] = React.useState({});

  const sync = React.useCallback(
    (force = false) => {
      if (force) syncUpdate({});
      else if (manual) return;
      else syncUpdate({});
    },
    [manual]
  );

  /** add a node to it's parent, don't care about it's children */
  const add = (
    id: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    { children, child, ...val }: Childable<Data>,
    parentId: string = ""
  ) => {
    const parent = dataMapRef.current.get(parentId);
    if (parent) {
      dataMapRef.current.set(parentId, {
        ...parent,
        childrenIds: [...(parent.childrenIds || []), id],
      });
    }

    dataMapRef.current.set(id, {
      ...val,
      id,
      parentIds: parentId ? [...(parent?.parentIds || []), parentId] : [],
    } as DataItem<Data>);
    sync();
  };

  /** remove a node, including it's all children */
  const del = (id: string) => {
    // remove id's all children
    getDescendantsById({
      id,
      map: dataMapRef.current,
      allChildren: true,
    }).forEach((descendant) => {
      dataMapRef.current.delete(descendant.id);
    });
    const parentIds = dataMapRef.current.get(id)?.parentIds || [];
    const parent = dataMapRef.current.get(parentIds[parentIds.length - 1]);
    if (parent) {
      dataMapRef.current.set(parent.id, {
        ...parent,
        // it should have childrenId
        childrenIds: parent.childrenIds?.filter((c) => c !== id),
      });
    }

    dataMapRef.current.delete(id);

    sync();
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const update = (id: string, { children, child, ...val }: Childable<Data>) => {
    const old = dataMapRef.current.get(id);
    if (!old) {
      throw "unknown node for id=" + id;
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const { children: _oC, id: oldId, ...oldData } = old;

    if (oldId !== id) {
      const pid = oldData.parentIds[oldData.parentIds.length - 1];
      del(id);
      add(id, Lo.merge(oldData as DataItem<Data>, val), pid);
    } else {
      dataMapRef.current.set(
        id,
        Lo.merge(oldData as DataItem<Data>, val, { id })
      );
    }
    sync();
  };

  const get = (id: string) => {
    return Lo.clone(dataMapRef.current.get(id));
  };

  /** only needed if you set manual=true */
  const synchro = React.useCallback(() => {
    if (manual) sync(true);
  }, [manual, sync]);

  return {
    data: dataMapRef.current,
    add,
    del,
    update,
    get,
    synchro,
  };
};

/**
 * transform a Map to a Tree
 * 
 * @example
 * ```ts
  makeTree(Array.from(dataMap.data.values()), {
    get: dataMap.get as any,
    transform: ({ id, ...item }) => ({ ...item, key: id }),
    noEmptyRoot: false,
  });
 * ```
 * 
 * @param opts.get get the item from any source
 * @param opts.transform transform map's data to the tree node
 * @param opts.noEmptyRoot true if tree don't show any no-children node
 */
export function makeTree<
  T extends {
    id: string;
    parentIds: string[];
  },
  U = any
>(
  dataList: T[],
  opts: {
    get: (id: string) => T;
    transform: (item: T) => U;
    noEmptyRoot?: boolean;
  }
) {
  type FinalItem = U & { depth: number; children?: U[] };

  const root = { depth: -1, children: [] as FinalItem[] };
  const list = Array.from(dataList);
  const nodeMap: Record<string, FinalItem> = {};

  list.forEach((it) => {
    const { id } = it;
    const pid = it.parentIds[it.parentIds?.length - 1];
    if (pid && !nodeMap[pid]) {
      nodeMap[pid] = { ...opts.transform(opts.get(pid)), depth: -1 };
    }
    const parent = nodeMap[pid] ?? root;
    const node = nodeMap[id] ?? {
      ...opts.transform(it),
      depth: (parent.depth || 0) + 1,
    };
    parent.children ??= [];
    parent.children.push(node);
    nodeMap[id] = node;
  });

  return opts?.noEmptyRoot
    ? root.children.filter((child) => child.children?.length !== 0)
    : root.children;
}
