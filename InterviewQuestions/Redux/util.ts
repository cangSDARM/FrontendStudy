import { Synchronizable, Listener, ListenerManage, ProxyManage, Store } from './type';

export const createStoreInterface = <Data, Actions extends Object>(
  actions: Actions,
  metadata: Synchronizable<Data>
): Store<Data, Actions> => {
  const assigned = Object.assign(actions, metadata);

  return Object.seal(assigned);
};

/** replace `x[0].v[1]` to `x.0.v.1` */
export function fixArrayAccessor(str: string) {
  return str.replaceAll(/\[(\d+)\]/g, '.$1');
}

export const createListener = (): ListenerManage => {
  let listeners: Listener[] = [];
  const listener2Properties = new WeakMap<Function, string[]>();

  return {
    emit: (properties = []) => {
      const isEmitAll = properties.length === 0;

      listeners.forEach(l => {
        if (isEmitAll) return l?.();

        const mappedProperties = listener2Properties.get(l) || [];
        // means listener listen for all properties. so just emit it
        if (mappedProperties.length === 0) return l?.();

        // has intersection between emitted props and listen props
        for (const prop of mappedProperties) {
          if (properties.includes(prop)) {
            // as break
            return l?.();
          }
        }
      });
    },
    subscribe: (listener, properties = []) => {
      listeners = [...listeners, listener];
      listener2Properties.set(listener, properties.map(fixArrayAccessor));

      return () => {
        listeners = listeners.filter(l => {
          const pass = l !== listener;
          listener2Properties.delete(l);

          return pass;
        });
      };
    },
  };
};

export const createProxy = <Data>(initial: Data): ProxyManage<Data> => {
  let proxy: { data: Data } = { data: initial };

  return {
    get() {
      return proxy.data;
    },
    assign(newData: Data) {
      Object.assign(proxy, { data: newData });
    },
  };
};
