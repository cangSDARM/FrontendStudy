import React from "react";

import { Player } from "@/sources/players/types";
import { BuiltinIcons } from "@/utils/Icons";

export type DataSourceFactoryInitializeArgs = {
  file?: File;
  files?: File[];
  params?: Record<string, string | undefined>;
};

type DataSourceFactoryType = "file" | "remote" | "sample";
type DataSourceFactoryProtocol = "http" | "ftp" | "websocket";

export type Field = {
  id: string;
  label: string;
  defaultValue?: string;
  placeholder?: string;
  description?: string;

  /**
   * Optional validate function
   *
   * The function is called with a value and can return an Error if the value should
   * be rejected. If the function returns `undefined`, then the value is accepted.
   */
  validate?: (value: string) => Error | undefined;
};

export interface IDataSourceFactory {
  id: string;

  // A list of alternate ids used to identify this factory
  // https://github.com/foxglove/studio/issues/4937
  legacyIds?: string[];

  type: DataSourceFactoryType;
  protocol: DataSourceFactoryProtocol;

  displayName: string;
  iconName?: BuiltinIcons;
  description?: string;
  docsLinks?: { label?: string; url: string }[];
  disabledReason?: string | JSX.Element;
  badgeText?: string;
  hidden?: boolean;
  warning?: string | JSX.Element;

  formConfig?: {
    // Initialization args are populated with keys of the _id_ field
    fields: Field[];
  };

  // If data source initialization supports "Open File" workflow, this property lists the supported
  // file types
  supportedFileTypes?: string[];

  supportsMultiFile?: boolean;

  // Initialize a player.
  initialize: (args: DataSourceFactoryInitializeArgs) => Player | undefined;
}

/**
 * Recently selected source information
 *
 * The _id_ is opaque and up to the PlayerSelectionContext implementation.
 */
export type RecentSource = {
  id: string;
  title: string;
  label?: string;
};

// File data sources accept either file instances or handles
type FileDataSourceArgs = {
  type: "file";
  files?: File[];
  handle?: FileSystemFileHandle;
};

type ConnectionDataSourceArgs = {
  type: "connection";
  params?: Record<string, string | undefined>;
};

export type DataSourceArgs = ConnectionDataSourceArgs; //| FileDataSourceArgs;

/**
 * PlayerSelectionContext exposes the available data sources and a function to set the current data source
 */
export interface PlayerSelection {
  active: (sourceId: string, args?: DataSourceArgs) => void;
  disable: (sourceId: string) => void;

  // selectRecent: (recentId: string) => void;

  /** Currently selected data source */
  selectedSource?: IDataSourceFactory;

  /** List of available data sources */
  availableSources: readonly IDataSourceFactory[];

  /** Recently selected sources */
  // recentSources: readonly RecentSource[];
}

const PlayerSelectionContext = React.createContext<PlayerSelection>({
  active: () => {},
  disable: () => {},
  // selectRecent: () => {},
  availableSources: [],
  // recentSources: [],
});
PlayerSelectionContext.displayName = "PlayerSelectionContext";

export function usePlayerSelection(): PlayerSelection {
  return React.useContext(PlayerSelectionContext);
}

export default PlayerSelectionContext;
