import React from "react";
import { IDataSourceFactory } from "@/react/PlayerSelectionContext";
import WebSocketDataSourceFactory from "@/sources/WebSocketDataSourceFactory";
import PlayerManager from "@/react/PlayerManager";
import { acquireLock } from "@/utils/spinLock";

const dataSources: IDataSourceFactory[] = [new WebSocketDataSourceFactory()];
const consoleToast = {
  warn: console.warn,
  error: console.error,
};

const Providers: React.FC<
  React.PropsWithChildren<{
    toast?: {
      warn: (msg: string) => void;
      error: (msg: string) => void;
    };
  }>
> = ({ children, toast = consoleToast }) => {
  React.useCallback(() => {
    acquireLock('provider');
  }, []);

  return (
    <PlayerManager sources={dataSources} toast={toast}>
      {children}
    </PlayerManager>
  );
};

export default Providers;
