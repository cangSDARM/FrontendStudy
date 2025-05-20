import { StoreCtor, Store } from './type';
import { createListener, createProxy, createStoreInterface } from './util';
import deepKeys from './deep-keys';
import { shallowEqual } from 'shallow-equal';

export const newStoreV2 = <Data, Actions extends Object>(
  initial: Data,
  ctor: StoreCtor<Data, Actions>
): Store<Data, Actions> => {
  const proxy = createProxy(initial);
  const listenerManage = createListener();

  const subscribe = listenerManage.subscribe.bind(listenerManage);
  const actions = ctor({
    emit: listenerManage.emit,
    subscribe,
    assign: proxy.assign.bind(proxy),
    get: proxy.get,
    dispatch(partialData) {
      // if (shallowEqual(proxy.get(), partialData)) return;

      proxy.assign(Object.assign({}, proxy.get(), partialData));
      listenerManage.emit(deepKeys(partialData, true));
    },
  });

  return createStoreInterface(actions, { getSnapshot: proxy.get, subscribe });
};
