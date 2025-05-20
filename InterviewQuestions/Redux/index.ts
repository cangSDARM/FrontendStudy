export type { Store } from './type';
export { useSyncStore, createSelectorHook } from './hook';
export { newStore } from './single';
export { newStoreFactory } from './multiple';
export { default as deepKeys } from './deep-keys';

/**
 *
> A React global state manager solution

## Store

### Single

```tsx
import { newStore, useSyncStore } from '@tool-sets/state';

const YourStore = newStore(
  {
    data: [] as string[], // store type definition
  },
  store => ({
    // store actions
    setSettings: (nSettings: ReturnType<typeof store.get>) => {
      const snapshot = store.get(); // get older data snapshot

      store.assign(nSettings); // assign new data to the store
      store.emit(); // trigger store change
    },
    // anther implement
    setSettings2: (nSettings: ReturnType<typeof store.get>) => {
      store.dispatch(nSettings); // assign and emit
    },
  })
);

// in or not in react:
SettingStore.setSettings({ data: [] });
SettingStore.getSnapshot(); // return current snapshot of the store
SettingStore.subscribe(() => {});
SettingStore.subscribe(() => {}, ['data[0]']); // support dependencies(key, lodash.get-ish) list

// in react:
const settings = useSyncStore(SettingStore);
```

### Namespaced

```tsx
import { newStoreFactory } from '@tool-sets/state';

const YourStores = newStoreFactory(
  {
    data: [] as string[], // store type definition
  },
  store => ({
    // store actions
    setSettings: (nSettings: ReturnType<typeof store.get>) => {
      const snapshot = store.get(); // get older data snapshot

      store.assign(nSettings); // assign new data to the store
      store.emit(); // trigger store change
    },
  })
);

// in or not in react:
const YourStore = YourStores.set('default');
// same as single store
```

### React bindings

> style 1

```jsx
const App = () => {
  const settings = useSyncStore(SettingStore);
  console.log(settings.data);

  return <></>;
};
```

> style2

```jsx
const useSettingsSelector = createSelectorHook(SettingStore);

const App = () => {
  const data = useSettingsSelector(setting => setting.data);
  console.log(data);

  return <></>;
};
```
 */
