import { newStore, useSyncStore } from "@tool-sets/state";

export type SocketListener = (data: any) => void;

// TODO: multiple context support
const weakMap = new WeakMap();
const ListenerStore = newStore({
  callbacks: {} as Record<string, SocketListener[]>,
})(store => {
  return {
    addSocketEventListener: (payload: { topic: string; listener: SocketListener }) => {
      const { topic, listener } = payload;
      if (weakMap.has(listener)) return;

      const snapshot = store.get();

      snapshot.callbacks[topic] ??= [];
      snapshot.callbacks[topic] = [...snapshot.callbacks[topic], listener];
      weakMap.set(listener, 1);

      store.assign(snapshot);
      store.emit();
    },
  };
});

export const { addSocketEventListener } = ListenerStore;

export const useListeners = () => {
  const { callbacks } = useSyncStore(ListenerStore);

  return { listeners: callbacks };
};
