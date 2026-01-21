import Lo from "lodash";
import React from "react";
import { useSyncStore } from "@tool-sets/state";
import { Player, SubscribePayload } from "@/sources/players/types";
import { Immutable } from "@/immutable";
import MessagePipelineStore, { createPlayerPipe, defaultPlayerState } from "@/store/message";

type FramePromise = { name: string; promise: Promise<void> };

function useMessagePipeline() {
  return useSyncStore(MessagePipelineStore);
}

export const MessagePipelineProvider: React.FC<
  React.PropsWithChildren<{
    player?: Player;
    /** default = 1000/60, 60fps */
    msPerFrame?: number;
  }>
> = ({ children, player, msPerFrame = 16.666666666666668 }) => {
  const promisesToWaitForRef = React.useRef<FramePromise[]>([]);

  // We make a new store when the player changes. This throws away any state from the previous store
  // and re-creates the pipeline functions and references. We make a new store to avoid holding onto
  // any state from the previous store.
  //
  // Note: This throws away any publishers, subscribers, etc that panels may have registered. We
  // are ok with this behavior because the <Workspace> re-mounts all panels when a player changes.
  // The re-mounted panels will re-initialize and setup new publishers and subscribers.
  React.useEffect(() => {
    MessagePipelineStore.rehook(player!);
  }, [player]);

  const subscriptions = useMessagePipeline().public.subscriptions;

  // Debounce the subscription updates for players. This batches multiple subscribe calls
  // into one update for the player which avoids fetching data that will be immediately discarded.
  //
  // The delay of 0ms is intentional as we only want to give one timeout cycle to batch updates
  const debouncedPlayerSetSubscriptions = React.useMemo(() => {
    return Lo.debounce((subs: Immutable<SubscribePayload[]>) => {
      player?.setSubscriptions(subs);
    });
  }, [player]);

  // Tell listener the layout has completed
  const renderDone = useMessagePipeline().renderDone;
  React.useLayoutEffect(() => {
    renderDone?.();
  }, [renderDone]);

  // when unmounting or changing the debounce function cancel any pending debounce
  React.useEffect(() => {
    return () => {
      debouncedPlayerSetSubscriptions.cancel();
    };
  }, [debouncedPlayerSetSubscriptions]);

  React.useEffect(() => {
    debouncedPlayerSetSubscriptions(subscriptions);
  }, [debouncedPlayerSetSubscriptions, subscriptions]);

  // // To avoid re-rendering the MessagePipelineProvider and all children when global variables change
  // // we register a listener directly on the context to track updates to global variables.
  // //
  // // We don't need to re-render because there's no react state update in our component that needs
  // // to render with this update.
  // const currentLayoutContext = useContext(CurrentLayoutContext);

  // useEffect(() => {
  //   // Track the last global variables we've received in the layout selector so we can avoid setting
  //   // the variables on a player unless they have changed because we don't want to tell a player about
  //   // new variables when there aren't any and make it potentially do work.
  //   let lastGlobalVariablesInstance: GlobalVariables | undefined =
  //     currentLayoutContext?.actions.getCurrentLayoutState().selectedLayout?.data?.globalVariables ??
  //     EMPTY_GLOBAL_VARIABLES;

  //   player?.setGlobalVariables(lastGlobalVariablesInstance);

  //   const onLayoutStateUpdate = (state: LayoutState) => {
  //     const globalVariables = state.selectedLayout?.data?.globalVariables ?? EMPTY_GLOBAL_VARIABLES;
  //     if (globalVariables !== lastGlobalVariablesInstance) {
  //       lastGlobalVariablesInstance = globalVariables;
  //       player?.setGlobalVariables(globalVariables);
  //     }
  //   };

  //   currentLayoutContext?.addLayoutStateListener(onLayoutStateUpdate);
  //   return () => {
  //     currentLayoutContext?.removeLayoutStateListener(onLayoutStateUpdate);
  //   };
  // }, [currentLayoutContext, player]);

  React.useEffect(() => {
    const { cleanup } = createPlayerPipe({
      msPerFrame: msPerFrame,
      promisesToWaitForRef,
      observable: player?.getStateObserver$(),
    });
    if (!player) {
      MessagePipelineStore.updatePlayerStateAction({
        playerState: defaultPlayerState(),
        renderDone: undefined,
      });
    }

    return () => {
      cleanup();
      MessagePipelineStore.updatePlayerStateAction({
        playerState: defaultPlayerState(),
        renderDone: undefined,
      });
    };
  }, [player, msPerFrame]);

  return children;
};
