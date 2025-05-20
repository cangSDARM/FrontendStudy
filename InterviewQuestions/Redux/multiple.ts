import { newStore } from './single';
import { Store, StoreCtor } from './type';

/** manage namespaced stores */
export const newStoreFactory = <Data, Actions extends Object>(initial: Data, factory: StoreCtor<Data, Actions>) => {
  const stores = new Map<string, Store<Data, Actions>>();

  return {
    clear: stores.clear.bind(stores),
    size: stores.size,
    has: stores.has.bind(stores),
    get: stores.get.bind(stores),
    set: (namespace: string) => {
      stores.set(namespace, newStore(initial, factory));

      return stores.get(namespace)!;
    },
  };
};
