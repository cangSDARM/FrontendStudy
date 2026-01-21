import React from "react";
import { getPeerContext, DefaultPeerId, getConnContext } from "./context";

export const useWebRTCPeer = (peerId: string) => {
  const context = getPeerContext(peerId);

  return React.useContext(context);
};

export const useWebRTCConn = (connId: string, peerId = DefaultPeerId) => {
  const peerContext = getPeerContext(peerId);
  const connContext = getConnContext(peerContext, connId);

  return React.useContext(connContext);
};
