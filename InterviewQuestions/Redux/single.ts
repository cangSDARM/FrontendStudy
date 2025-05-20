import { Store, StoreCtor } from './type';
import { newStoreV1 } from './outdated';
import { newStoreV2 } from './newStore';

/** @deprecated */
export function newStore<Data>(
  initial: Data
): <Actions extends Object>(ctor: StoreCtor<Data, Actions>) => Store<Data, Actions>;

/**
 * a optimized React.context reimplementation
 *
 * _ONLY WORK FOR React18+_
 *
 * {@link https://zh-hans.react.dev/reference/react/useSyncExternalStore | How this work?}
 *
 * @example
 * ```ts
 * // declare a store
 * const SettingStore = newStore<Record<string,string>>({ 'initialKey': 'initialValue' }, {
 *   setSettings: (newData: Record<string,string>) => {
 *     // get old data from store
 *     const oldData = store.get();
 *     if (Object.is(oldData, newData)) return;
 *
 *     // assign a new data to the store;
 *     store.assign(r);
 *     // emit all listeners
 *     store.emit();
 *   },
 * }));
 * // update: in or out react
 * SettingStore.setSettings({});
 * // access: in react
 * const state = useSyncStore(SettingStore);
 * ```
 */
export function newStore<Data, Actions extends Object>(
  initial: Data,
  ctor: StoreCtor<Data, Actions>
): Store<Data, Actions>;

export function newStore<Data, Actions extends Object>(initial: Data, ctor?: StoreCtor<Data, Actions>) {
  if (!ctor) return newStoreV1(initial);

  return newStoreV2(initial, ctor);
}
