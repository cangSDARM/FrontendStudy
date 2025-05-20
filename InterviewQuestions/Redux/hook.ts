import React from 'react';
import { Synchronizable, Store } from './type';

export const useSyncStore = <S extends Synchronizable<any>, Sn = S extends Synchronizable<infer R> ? R : any>(
  store: S
) => {
  return React.useSyncExternalStore<Sn>(store.subscribe, store.getSnapshot);
};

// TODO: Implemented as a lower-level interface than useSyncStore (custom subscriber/getSnapshot)
/**
 * create a redux style `useSelector` hook
 */
export const createSelectorHook = <Data, Actions>(s: Store<Data, Actions>) => {
  return <Property>(selector: (store: Data & Actions) => Property) => {
    const store = useSyncStore(s);
    const selectable = React.useMemo(() => {
      const participates: any = { ...s, ...store };
      delete participates.getSnapshot; // delete those data cannot selectable
      delete participates.subscribe;

      return participates;
    }, [store]);

    return React.useMemo(() => {
      return selector(selectable);
    }, [selectable]);
  };
};
