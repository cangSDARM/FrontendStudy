export type Listener = () => void;
export type GetSnapshot<Data> = () => Data;
export type Subscribe = (listener: Listener, properties?: string[]) => () => void;

export type ListenerManage = {
  /** can be emit by any deepKeys, trigger related listener */
  emit: (properties?: string[]) => void;
  subscribe: Subscribe;
};
export type ProxyManage<Data> = {
  /** assign(Object.assign) data without trigger listener */
  assign(newData: Data): void;
  /** get current snapshot */
  get(): Data;
};

export type Synchronizable<Data> = {
  getSnapshot: GetSnapshot<Data>;
  /** listener can be associated with the data's deepKeys
   * 
   * key's style: `a[0].b.c`
   */
  subscribe: Subscribe;
};
export type StoreCtor<Data, Actions> = (
  store: Pick<ListenerManage, 'emit' | 'subscribe'> &
    Pick<ProxyManage<Data>, 'assign' | 'get'> & {
      /**
       * assign the data and emit the listeners associated with the `partialData`'s deepKeys
       *
       * if and only if the shallow comparison is false */
      dispatch: (partialData: Partial<Data>) => void;
    }
) => Actions;

export type StoreMeta<Data, Actions> = {};

export type Store<Data, Actions> = Actions & Synchronizable<Data> & StoreMeta<Data, Actions>;
