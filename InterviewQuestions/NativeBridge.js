class JsViewer {
  constructor(config) {
    const { address } = config;
    globalThis.nativeBridgeCall({ __bridge_message__: "init...", ...config });

    globalThis.nativeBridgeCall({
      address,
      __bridge_message__: "init successes",
    });
  }

  ready = true;

  async sign(
    transaction = false,
    privateKey,
    useTronHeader = true,
    multisig = false,
    callback = false,
  ) {
    if (typeof privateKey === "function") {
      callback = privateKey;
    } else if (typeof useTronHeader === "function") {
      callback = useTronHeader;
    } else if (typeof multisig === "function") {
      callback = multisig;
    }

    try {
      if (typeof callback !== "function") {
        callback = (err, info) => {
          if (err) {
            return Promise.reject(err);
          } else {
            return Promise.resolve(info);
          }
        };
      }

      const injected = await globalThis.nativeBridgeCall({
        transaction,
        privateKey,
        useTronHeader,
        multisig,
        callback,
        __bridge_message__: "sign",
      });
      if (injected) {
        // globalThis.nativeBridgeCall(injected);
        return callback(null, injected);
      }
    } catch (e) {
      if (typeof e === "string") {
        return callback(e);
      } else {
        globalThis.nativeBridgeCall(
          Object.assign(
            {
              __bridge_message__: "sign err",
            },
            e,
          ),
        );
        return callback(e);
      }
    }
  }

  async request(...args) {
    return globalThis.nativeBridgeCall(
      Object.assign({}, JSON.parse(JSON.stringify(args)), {
        __bridge_message__: "request",
      }),
    );
  }
}

(function () {
  try {
    globalThis.promises = {};
    globalThis.__callee__ = {};
    globalThis.resolvePromise = function (promiseId, data, error) {
      if (error) {
        globalThis.promises[promiseId].reject(data);
      } else {
        globalThis.promises[promiseId].resolve(data);
      }
      // remove referenfe to stored promise
      delete globalThis.promises[promiseId];
    };
    globalThis.injected = function (injector = "jsviewer") {
      const isAndroidInjected =
        window[injector] && window[injector].postMessage;
      const isIosInjected =
        globalThis.webkit &&
        globalThis.webkit.messageHandlers &&
        globalThis.webkit.messageHandlers[injector] &&
        globalThis.webkit.messageHandlers[injector].postMessage;
      if (isAndroidInjected) {
        globalThis.webkitPlatform = "android";
        globalThis.injected = function (injector = "jsviewer") {
          return window[injector].postMessage.bind(window[injector]);
        };
        return window[injector].postMessage.bind(window[injector]);
      } else if (isIosInjected) {
        globalThis.webkitPlatform = "ios";
        globalThis.injected = function (injector = "jsviewer") {
          return globalThis.webkit.messageHandlers[injector].postMessage.bind(
            globalThis.webkit.messageHandlers[injector],
          );
        };
        return globalThis.webkit.messageHandlers[injector].postMessage.bind(
          globalThis.webkit.messageHandlers[injector],
        );
      } else {
        return function (...args) {
          globalThis.location.replace(`${injector}.${JSON.stringify(args)}`);
        };
      }
    };
    globalThis.nativeBridgeCall = function (data) {
      return new Promise((res, rej) => {
        const promiseId = new Date().getTime();
        globalThis.promises[promiseId] = { resolve: res, reject: rej };

        const typed = typeof data === "string" ? { message: data } : data;

        try {
          const fn = globalThis.injected("jsviewer");
          const merged = Object.assign({}, typed, {
            promiseId: promiseId,
            __callee__: globalThis.__callee__ || "",
          });
          /// android only allow recive string|number
          if (globalThis.webkitPlatform === "android") {
            fn(JSON.stringify(merged));
          } else {
            fn(merged);
          }
        } catch (e) {
          rej(e);
        }
      });
    };

    globalThis.addEventListener("unhandledrejection", function (...args) {
      globalThis.nativeBridgeCall(
        Object.assign(
          {
            __bridge_message__: "onunhandledrejection",
          },
          args,
        ),
      );
    });
    globalThis.addEventListener("error", function (...args) {
      globalThis.nativeBridgeCall(
        Object.assign(
          {
            __bridge_message__: "onerror",
          },
          args,
        ),
      );
    });
  } catch (e) {
    globalThis.alert(e.toString());
  }
})();

/**
 * 

> js -> native

call warped function

```js
window.nativeBridgeCall({ data });
```

> native -> js

call exported function

```js
window.resolvePromise(promiseId, data, error);
```

More Info: http://igomobile.de/2017/03/06/wkwebview-return-a-value-from-native-code-to-javascript/
*/
