import React from "react";

type SocketContext = {
  socket: WebSocket | undefined;
};

const SocketContexts = new Map<string, React.Context<SocketContext>>();

export const getSocketContext = (id: string) => {
  if (SocketContexts.has(id)) {
    return SocketContexts.get(id)!;
  }

  const context = React.createContext<SocketContext>({ socket: undefined });
  SocketContexts.set(id, context);

  return context;
};
