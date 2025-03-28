import React from "react";
import { getSocketContext } from "./context";
import { useListeners } from "./listeners";

const NetworkCausedClose = [1003, 1006, 1007, 1012, 1013, 1014, 1015];

export type SocketProviderProps = React.PropsWithChildren<{
  onOffline?: (socket: WebSocket) => void;
  onConnectFail?: (socket: WebSocket, isNetworkFail: boolean) => void;
  /** websocket uri */
  uri: string;
  onConnectSuccess?: (socket: WebSocket, _event: Event) => void;
  /** use this uri to detect network connection. GET method
   *
   * usually /favicon.svg is used
   */
  networkDetector?: string;
  /** transform data to listener. if not provide, all events goto default/wildcard topic: \* */
  transform?: (data: any) => { topic: string; data: any };
}>;

const SocketProvider: React.FC<SocketProviderProps> = ({
  children,
  uri,
  onConnectSuccess,
  onOffline,
  onConnectFail,
  networkDetector,
  transform,
}) => {
  const context = getSocketContext("default");
  const [socket, setSocket] = React.useState<WebSocket | undefined>();
  const { listeners } = useListeners();

  const reconnect = React.useCallback(
    (ws: WebSocket) => {
      ws.addEventListener("open", ev => onConnectSuccess?.(ws, ev));
      ws.addEventListener("close", evt => {
        console.error("websocket closed", evt);
        if (evt.code && NetworkCausedClose.includes(evt.code)) {
          if (typeof networkDetector === "string") {
            fetch(networkDetector)
              .then(resp => {
                if (!resp.ok) {
                  onOffline?.(ws);
                } else {
                  onConnectFail?.(ws, true);
                }
              })
              .catch(() => {
                onOffline?.(ws);
              });
          }
        } else {
          onConnectFail?.(ws, false);
        }
      });
    },
    [onConnectSuccess, onConnectFail, onOffline]
  );

  React.useEffect(() => {
    setSocket(() => {
      const ws = new WebSocket(uri);
      reconnect(ws);
      return ws;
    });
  }, [uri]);

  React.useEffect(() => {
    if (!socket) return;

    socket.onmessage = ev => {
      let detail = ev.data;
      console.debug("websocket raw event", detail);
      try {
        detail = JSON.parse(ev.data);
      } finally {
        if (typeof transform === "function") {
          detail = transform(detail);
        } else {
          detail = {
            topic: "*",
            data: detail,
          };
        }

        console.debug("websocket emit event", detail);
        listeners[detail.topic]?.forEach(listener => {
          listener(detail.data);
        });
      }
    };
  }, [socket, listeners, transform]);

  return <context.Provider value={{ socket }}>{children}</context.Provider>;
};

export default SocketProvider;
