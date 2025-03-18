import React from "react";

// import Logger from "@foxglove/log";
// import { Immutable } from "@/types/immutable";
import { MessagePipelineProvider } from "@/react/MessagePipeline";
// import { ExtensionCatalogContext } from "@foxglove/studio-base/context/ExtensionCatalogContext";
import PlayerSelectionContext, {
  DataSourceArgs,
  IDataSourceFactory,
  PlayerSelection,
} from "@/react/PlayerSelectionContext";
// import useIndexedDbRecents, {
//   RecentRecord,
// } from "@foxglove/studio-base/hooks/useIndexedDbRecents";
// import {
//   TopicAliasFunctions,
//   TopicAliasingPlayer,
// } from "@foxglove/studio-base/players/TopicAliasingPlayer/TopicAliasingPlayer";
import { Player } from "@/sources/players/types";

const log = window.console; //Logger.getLogger(__filename);

type PlayerManagerProps = {
  sources: readonly IDataSourceFactory[];
  toast: {
    warn: (msg: string) => void;
    error: (msg: string) => void;
  }
};

const useMountedState = () => {
  const mountedRef = React.useRef(false);

  React.useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  });

  return () => {
    return mountedRef.current;
  };
};

const wrapPlayer = (c: any) => c;
const PlayerManager: React.FC<React.PropsWithChildren<PlayerManagerProps>> = ({ children, sources, toast }) => {
  const isMounted = useMountedState();

  const [playerInstances, setPlayerInstances] = React.useState<
    | {
        // topicAliasPlayer: TopicAliasingPlayer;
        player: Player;
      }
    | undefined
  >();

  // const { recents, addRecent } = useIndexedDbRecents();

  const constructPlayers = React.useCallback(
    (newPlayer: Player | undefined) => {
      if (!newPlayer) {
        setPlayerInstances(undefined);
        return undefined;
      }

      // const topicAliasingPlayer = new TopicAliasingPlayer();
      const finalPlayer = wrapPlayer(newPlayer);
      setPlayerInstances({
        // topicAliasPlayer: topicAliasingPlayer,
        player: finalPlayer,
      });
    },
    [wrapPlayer]
  );

  // Update the alias functions when they change. We do not need to re-render the player manager
  // since nothing in the local state has changed.
  // const extensionCatalogContext = useContext(ExtensionCatalogContext);
  // useEffect(() => {
  //   // Stable empty alias functions if we don't have any
  //   const emptyAliasFunctions: Immutable<TopicAliasFunctions> = [];

  //   // We only want to set alias functions on the player when the functions have changed
  //   let topicAliasFunctions =
  //     extensionCatalogContext.getState().installedTopicAliasFunctions ?? emptyAliasFunctions;
  //   playerInstances?.topicAliasPlayer.setAliasFunctions(topicAliasFunctions);

  //   return extensionCatalogContext.subscribe((state) => {
  //     if (topicAliasFunctions !== state.installedTopicAliasFunctions) {
  //       topicAliasFunctions = state.installedTopicAliasFunctions ?? emptyAliasFunctions;
  //       playerInstances?.topicAliasPlayer.setAliasFunctions(topicAliasFunctions);
  //     }
  //   });
  // }, [extensionCatalogContext, playerInstances?.topicAliasPlayer]);

  const [selectedSource, setSelectedSource] = React.useState<IDataSourceFactory | undefined>();

  const selectSource = React.useCallback(
    async (sourceId: string, args?: DataSourceArgs) => {
      log.debug(`Select Source: ${sourceId}`);

      const foundSource = sources.find(source => source.id === sourceId || source.legacyIds?.includes(sourceId));
      if (!foundSource) {
        toast.warn(`Unknown data source: ${sourceId}`);
        return;
      }

      setSelectedSource(foundSource);

      // Sample sources don't need args or prompts to initialize
      if (foundSource.type === "sample") {
        const newPlayer = foundSource.initialize({});

        constructPlayers(newPlayer);
        return;
      }

      try {
        if (!args) {
          toast.error("Unable to initialize player: no args");
          setSelectedSource(undefined);
          return;
        }

        switch (args.type) {
          case "connection": {
            const newPlayer = foundSource.initialize({
              params: args.params,
            });
            constructPlayers(newPlayer);

            // if (args.params?.url) {
            //   addRecent({
            //     type: "connection",
            //     sourceId: foundSource.id,
            //     title: args.params.url,
            //     label: foundSource.displayName,
            //     extra: args.params,
            //   });
            // }

            return;
          }
          // case "file":
          default: {
            log.error("Dont support %s player yet", args.type);
            return;
            // const handle = args.handle;
            // const files = args.files;

            // // files we can try loading immediately
            // // We do not add these to recents entries because putting File in indexedb results in
            // // the entire file being stored in the database.
            // if (files) {
            //   let file = files[0];
            //   const fileList: File[] = [];

            //   for (const curFile of files) {
            //     file ??= curFile;
            //     fileList.push(curFile);
            //   }
            //   const multiFile =
            //     foundSource.supportsMultiFile === true && fileList.length > 1;

            //   const newPlayer = foundSource.initialize({
            //     file: multiFile ? undefined : file,
            //     files: multiFile ? fileList : undefined,
            //   });

            //   constructPlayers(newPlayer);
            //   return;
            // } else if (handle) {
            //   // @ts-ignore
            //   const permission = await handle.queryPermission({ mode: "read" });
            //   if (!isMounted()) {
            //     return;
            //   }

            //   if (permission !== "granted") {
            //     // @ts-ignore
            //     const newPerm = await handle.requestPermission({
            //       mode: "read",
            //     });
            //     if (newPerm !== "granted") {
            //       throw new Error(`Permission denied: ${handle.name}`);
            //     }
            //   }

            //   const file = await handle.getFile();
            //   if (!isMounted()) {
            //     return;
            //   }

            //   const newPlayer = foundSource.initialize({
            //     file,
            //   });

            //   constructPlayers(newPlayer);
            //   // addRecent({
            //   //   type: "file",
            //   //   title: handle.name,
            //   //   sourceId: foundSource.id,
            //   //   handle,
            //   // });

            //   return;
            // }
          }
        }

        toast.error("Unable to initialize player");
      } catch (error) {
        toast.error((error as Error).message);
      }
    },
    [
      sources,
      constructPlayers,
      // addRecent,
      isMounted,
    ]
  );

  const closeSource = React.useCallback(
    (sourceId: string) => {
      try {
        if (selectedSource?.id === sourceId) {
          playerInstances!.player.close();
          setPlayerInstances(undefined);
          setSelectedSource(undefined);
        }
      } catch (e) {
        log.error(e);
        toast.error("Cannot close the source");
      }
    },
    [selectedSource?.id]
  );

  // Select a recent entry by id
  // necessary to pull out callback creation to avoid capturing the initial player in closure context
  // eslint-disable-next-line react-hooks/exhaustive-deps
  // const selectRecent = useCallback(
  //   createSelectRecentCallback(recents, selectSource),
  //   [recents, selectSource]
  // );

  // Make a RecentSources array for the PlayerSelectionContext
  // const recentSources = useMemo(() => {
  //   return recents.map((item) => {
  //     return { id: item.id, title: item.title, label: item.label };
  //   });
  // }, [recents]);

  const value: PlayerSelection = {
    active: selectSource,
    disable: closeSource,
    // selectRecent,
    selectedSource,
    availableSources: sources,
    // recentSources,
  };

  return (
    <>
      <PlayerSelectionContext.Provider value={value}>
        <MessagePipelineProvider player={playerInstances?.player}>{children}</MessagePipelineProvider>
      </PlayerSelectionContext.Provider>
    </>
  );
};

export default PlayerManager;

/**
 * This was moved out of the PlayerManager function due to a memory leak occurring in memoized state of Start.tsx
 * that was retaining old player instances. Having this callback be defined within the PlayerManager makes it store the
 * player at instantiation within the closure context. That callback is then stored in the memoized state with its closure context.
 * The callback is updated when the player changes but part of the `Start.tsx` holds onto the formerly memoized state for an
 * unknown reason.
 * To make this function safe from storing old closure contexts in old memoized state in components where it
 * is used, it has been moved out of the PlayerManager function.
 */
// function createSelectRecentCallback(
//   recents: RecentRecord[],
//   selectSource: (
//     sourceId: string,
//     dataSourceArgs: DataSourceArgs
//   ) => Promise<void>,
// ) {
//   return (recentId: string) => {
//     // find the recent from the list and initialize
//     const foundRecent = recents.find((value) => value.id === recentId);
//     if (!foundRecent) {
//       toast.error(`Failed to restore recent: ${recentId}`);
//       return;
//     }

//     switch (foundRecent.type) {
//       case "connection": {
//         void selectSource(foundRecent.sourceId, {
//           type: "connection",
//           params: foundRecent.extra,
//         });
//         break;
//       }
//       case "file": {
//         void selectSource(foundRecent.sourceId, {
//           type: "file",
//           handle: foundRecent.handle,
//         });
//       }
//     }
//   };
// }
