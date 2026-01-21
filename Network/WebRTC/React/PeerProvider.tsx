import React from "react";
import Peer from "peerjs";
import { DefaultPeerId, getPeerContext } from "./context";

const RTCPeerProvider: React.FC<
  React.PropsWithChildren<{
    id?: string;
    onIceSelect: (id: string) => Promise<string>;
    onConnectSuccess?: (socket: Peer, _event: Event) => void;
    onConnectFail?: (socket: Peer, event: Event) => void;
  }>
> = ({
  children,
  onIceSelect,
  onConnectSuccess,
  onConnectFail,
  id = DefaultPeerId,
}) => {
  const context = getPeerContext(id);
  const [ice, setIce] = React.useState("");
  const [peer, setPeer] = React.useState<Peer | undefined>();

  const stop = React.useCallback(() => {
    console.log("[WebRTCProvider] Stopping peer");
    peer?.destroy();
    setPeer(null);
  }, [onConnectFail]);

  // TODO: upgrade to reconnect
  const connect = React.useCallback(
    (peer: Peer) => {
      peer.on("open", (ev) => onConnectSuccess?.(peer, ev));
      peer.on("close", (ev) => {
        stop();
        onConnectFail?.(peer, ev);
      });
    },
    [onConnectSuccess, stop],
  );

  React.useEffect(() => {
    onIceSelect(id).then((ice) => {
      const peer = new Peer({
        debug: 3,
        config: {
          iceServers: ice,
        },
      });
      setPeer(peer);
      setIce(ice);

      connect(peer);
    });
  }, [id]);

  return (
    <context.Provider value={{ peer, ice, stop }}>{children}</context.Provider>
  );
};

export default RTCPeerProvider;
