// https://www.smashingmagazine.com/2022/08/react-context-propagation-javascript/

const EMPTY_CONTEXT = Symbol();
function createContext(defaultContextValue) {
  let contextValue = EMPTY_CONTEXT;

  return {
    Provider,
    Consumer,
  };

  function Consumer() {
    return isInsideContext() ? contextValue : defaultContextValue;
  }

  function Provider(value, cb) {
    // nested context
    const parentContext = isInsideContext() ? Consumer() : EMPTY_CONTEXT;

    contextValue = value;

    const res = cb();

    contextValue = parentContext;
    return res;
  }

  function isInsideContext() {
    return contextValue !== EMPTY_CONTEXT;
  }
}

// usage
const ctx = createContext("val");
ctx.Provider("text", () => {
  console.log(ctx.Consumer()); // 'text'

  ctx.Provider("sub", () => {
    console.log(ctx.Consumer()); // 'sub'
  });
});
console.log(ctx.Consumer()); // 'val'
