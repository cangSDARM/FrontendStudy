import React from "react";
import Peer, { DataConnection } from "peerjs";

export type WebRTCPeer = {
  peer: Peer | undefined;
  ice: string | undefined;
  stop?: () => void;
};

export const DefaultPeerId = "default";

const PeerContexts = new Map<string, React.Context<WebRTCPeer>>();

const noop = (): void => void 0;

export function getPeerContext(id: string) {
  if (PeerContexts.has(id)) {
    return PeerContexts.get(id)!;
  }

  const context = React.createContext<WebRTCPeer>({
    peer: undefined,
    ice: undefined,
    stop: noop,
  });
  PeerContexts.set(id, context);

  return context;
}

export type WebRTCConn = {
  conn: DataConnection | undefined;
  connected: boolean;
};

const ConnsContexts = new WeakMap<
  React.Context<WebRTCPeer>,
  Map<string, React.Context<WebRTCConn>>
>();

export function getConnContext(
  peerContext: React.Context<WebRTCPeer>,
  id: string,
) {
  if (peerContext.peer === null) {
    throw new Error(`Connection of ${id} must be used within a WebRTCProvider`);
  }

  if (!ConnsContexts.has(peerContext)) {
    ConnsContexts.set(peerContext, new Map());
  }

  const contexts = ConnsContexts.get(peerContext)!;
  if (contexts.has(id)) {
    return contexts.get(id)!;
  }

  const context = React.createContext<WebRTCConn>({
    conn: undefined,
    connected: false,
  });
  contexts.set(id, context);

  return context;
}
