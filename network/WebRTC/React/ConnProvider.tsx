import React from "react";
import { DataConnection } from "peerjs";
import { getConnContext, DefaultPeerId } from "./context";
import { useWebRTCPeer } from "./hooks";
import { useListeners } from "./listeners";

const WebRTCConnProvider: React.FC<
  React.PropsWithChildren<{
    id: string;
    onConnOpen?: (conn: DataConnection) => void;
    onConnClose?: (conn: DataConnection) => void;
    onConnError?: (conn: DataConnection) => void;
  }>
> = ({ children, onConnOpen, onConnClose, onConnError, id }) => {
  const peerContext = useWebRTCPeer(DefaultPeerId);
  const context = getConnContext(peerContext, id);

  const [conn, setConn] = React.useState<DataConnection | undefined>();
  const [connected, setConnected] = React.useState(false);
  const { listeners } = useListeners();

  const handleOpen = React.useCallback(() => {
    onConnOpen?.(conn);
    setConnected(true);
  }, [onConnOpen, conn]);

  const handleClose = React.useCallback(() => {
    console.log("%s connection closed", id);
    onConnClose?.(conn);
    setConnected(false);
    setConn(null);
  }, [onConnClose, conn]);

  const handleError = React.useCallback(
    (err: Error) => {
      console.error("%o connection error:", err);
      onConnError?.(conn);
      if (conn.open) conn.close();
      else handleClose();
    },
    [handleClose, onConnError, conn],
  );

  React.useEffect(() => {
    if (!peerContext.peer) return;
    console.log("%s connecting to peer", id);

    const peer = peerContext.peer;
    const conn = peer.connect(id, { reliable: true });
    setConn(conn);

    const handleData = (data: unknown) => {
      listeners?.forEach((listener) => listener?.(data));
    };

    conn.on("open", handleOpen);
    conn.on("data", handleData);
    conn.on("error", handleError);
    conn.on("close", handleClose);
    peer.on("error", handleError);

    return () => {
      console.log("%s cleaning up connection", id);
      if (conn.open) {
        conn.close();
      } else {
        conn.once("open", () => {
          conn.close();
        });
      }

      conn.off("open", handleOpen);
      conn.off("data", handleData);
      conn.off("error", handleError);
      conn.off("close", handleClose);
      peer.off("error", handleError);
    };
  }, [peerContext.peer, id, handleClose, handleError, listeners, handleOpen]);

  return (
    <context.Provider value={{ conn, connected }}>{children}</context.Provider>
  );
};

export default WebRTCConnProvider;
