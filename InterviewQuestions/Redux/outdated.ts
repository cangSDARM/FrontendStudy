import { StoreCtor } from './type';
import { newStoreV2 } from './newStore';

export const newStoreV1 =
  <Data>(initial: Data) =>
  <Actions extends Object>(ctor: StoreCtor<Data, Actions>) => {
    return newStoreV2(initial, ctor);
  };
