let lock = '';

export const acquireLock = (actor = '') => {
  if (lock && lock !== actor) throw "cannot use class and provider format at same time!";

  lock = actor;
};
