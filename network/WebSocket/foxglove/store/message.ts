import Lo from "lodash";
import {
  Subject as Subject$,
  Observable,
  takeUntil,
  exhaustMap,
  delayWhen,
  from as RxFrom,
  of as RxOf,
  timer as RxTimer,
} from "rxjs";
import { newStore } from "@tool-sets/state";
import {
  Player,
  PlayerState,
  PlayerPresence,
  MessageEvent,
  Topic,
  AdvertiseOptions,
  PublishPayload,
  SubscribePayload,
  PlayerProblem,
} from "@/sources/players/types";
import { Immutable } from "@/immutable";
import { RosDatatypes } from "@/utils/rosDatatypesToMessageDefinition";
import { mergeSubscriptions } from "@/utils/subscriptions";
import MessageOrderTracker from "@/utils/MessageOrderTracker";
import { pauseFrameForPromises } from "@/utils/pauseFrameForPromise";
import ConverterStore, { getSubscribeConvertible, isConverterChanged } from "./converter";

type FramePromise = { name: string; promise: Promise<void> };

export interface MessagePipelineState {
  player?: Player;
  subscriptionsById: Map<string, Immutable<SubscribePayload[]>>;
  /** This holds the last message emitted by the player on each topic. Attempt to use this before falling back to player backfill.
   */
  lastMessageEventByTopic: Map<string, MessageEvent>;
  /** Function to call when react render has completed with the latest state */
  renderDone?: () => void;
  /**
   * A map of topic name to the IDs that are subscribed to that topic. Incoming messages
   * are bucketed by ID so only the messages a panel subscribed to are sent to it.
   *
   * Note: Even though we avoid storing the same ID twice in the array, we use an array rather than
   * a Set because iterating over array elements is faster than iterating a Set and the "hot" path
   * for dispatching messages needs to iterate over the array of IDs.
   */
  subscriberIdsByTopic: Map<string, string[]>;

  publishersById: { [key: string]: AdvertiseOptions[] };
  allPublishers: AdvertiseOptions[];
  /** used to keep track of whether we need to allow call the player's startPlayback/playUntil/etc. */
  lastCapabilities: string[];
  public: {
    /** all managed(automatically sub/unsub) subscriptions */
    subscriptions: Immutable<SubscribePayload[]>;
    playerState: PlayerState;
    messageEventsBySubscriberId: Map<string, MessageEvent[]>;
    sortedTopics: Topic[];
    datatypes: RosDatatypes;
  };
}

export function defaultPlayerState(player?: Player): PlayerState {
  return {
    // when there is a player we default to initializing, to prevent thrashing in the UI when
    // the player is initialized.
    presence: player ? PlayerPresence.INITIALIZING : PlayerPresence.NOT_PRESENT,
    progress: {},
    capabilities: [],
    profile: undefined,
    playerId: "",
    activeData: undefined,
    advertised: true,
  };
}

const MessagePipelineStore = newStore(
  {
    player: undefined,
    subscriptionsById: new Map(),
    lastMessageEventByTopic: new Map(),
    subscriberIdsByTopic: new Map(),
    lastCapabilities: [],
    publishersById: {},
    allPublishers: [],
    public: {
      subscriptions: [],
      playerState: defaultPlayerState(),
      messageEventsBySubscriberId: new Map(),
      sortedTopics: [],
      datatypes: new Map(),
    },
  } as MessagePipelineState,
  ({ get, dispatch }) => {
    return {
      /** clear all state(include player) */
      rehook: (player: Player) => {
        dispatch({
          player: player,
          publishersById: {},
          allPublishers: [],
          subscriptionsById: new Map(),
          lastMessageEventByTopic: new Map(),
          subscriberIdsByTopic: new Map(),
          lastCapabilities: [],
          public: {
            subscriptions: [],
            playerState: defaultPlayerState(),
            messageEventsBySubscriberId: new Map(),
            sortedTopics: [],
            datatypes: new Map(),
          },
        });
      },
      /** Reset public and private state back to initial empty values (without losing player) */
      reset: () => {
        const snapshot = get();
        dispatch({
          ...snapshot,
          publishersById: {},
          allPublishers: [],
          // subscriptionMemoizer: makeSubscriptionMemoizer(),
          subscriptionsById: new Map(),
          subscriberIdsByTopic: new Map(),
          // newTopicsBySubscriberId: new Map(),
          lastMessageEventByTopic: new Map(),
          lastCapabilities: [],
          public: {
            ...snapshot.public,
            playerState: defaultPlayerState(),
            subscriptions: [],
            sortedTopics: [],
            messageEventsBySubscriberId: new Map(),
            datatypes: new Map(),
            // startPlayback: undefined,
            // playUntil: undefined,
            // pausePlayback: undefined,
            // setPlaybackSpeed: undefined,
            // seekPlayback: undefined,
            // enableRepeatPlayback: undefined,
          },
        });
      },
      /** Update subscriptions. New topics that have already emit messages previously we emit the last message on the topic to the subscriber */
      setSubscriptions(action: { id: string; payloads: Immutable<SubscribePayload[]> }) {
        const prevState = MessagePipelineStore.getSnapshot();
        const previousSubscriptionsById = prevState.subscriptionsById;

        const subscriptionsById = new Map(previousSubscriptionsById);

        if (action.payloads.length === 0) {
          // When a subscription id has no topics we removed it from our map
          subscriptionsById.delete(action.id);
        } else {
          subscriptionsById.set(action.id, action.payloads);
        }

        const subscriberIdsByTopic = new Map<string, string[]>();

        // make a map of topics to subscriber ids
        for (const [id, subs] of subscriptionsById) {
          for (const subscription of subs) {
            const topic = subscription.topic;

            const ids = subscriberIdsByTopic.get(topic) ?? [];
            // If the id is already present in the array for the topic then we should not add it again.
            // If we add it again it will be given frame messages again when bucketing incoming messages
            // by subscriber id.
            if (!ids.includes(id)) {
              ids.push(id);
            }
            subscriberIdsByTopic.set(topic, ids);
          }
        }

        // Record any _new_ topics for this subscriber so that we can emit last messages on these topics
        const newTopicsForId = new Set<string>();

        const prevSubsForId = previousSubscriptionsById.get(action.id);
        const prevTopics = new Set(prevSubsForId?.map(sub => sub.topic) ?? []);
        for (const { topic: newTopic } of action.payloads) {
          if (!prevTopics.has(newTopic)) {
            newTopicsForId.add(newTopic);
          }
        }

        const lastMessageEventByTopic = new Map(prevState.lastMessageEventByTopic);

        for (const topic of prevTopics) {
          // if this topic has no other subscribers, we want to remove it from the lastMessageEventByTopic.
          // This fixes the case where if a panel unsubscribes, triggers playback, and then resubscribes,
          // they won't get this old stale message when they resubscribe again before getting the message
          // at the current time frome seek-backfill.
          if (!subscriberIdsByTopic.has(topic)) {
            lastMessageEventByTopic.delete(topic);
          }
        }

        // Inject the last message on new topics for this subscriber
        const messagesForSubscriber = [];
        for (const topic of newTopicsForId) {
          const msgEvent = lastMessageEventByTopic.get(topic);
          if (msgEvent) {
            messagesForSubscriber.push(msgEvent);
          }
        }

        let newMessagesBySubscriberId;

        if (messagesForSubscriber.length > 0) {
          newMessagesBySubscriberId = new Map<string, MessageEvent[]>(prevState.public.messageEventsBySubscriberId);
          // This should update only the panel that subscribed to the new topic
          newMessagesBySubscriberId.set(action.id, messagesForSubscriber);
        }

        const subscriptions = mergeSubscriptions(Array.from(subscriptionsById.values()).flat());

        const newPublicState = {
          ...prevState.public,
          subscriptions,
          messageEventsBySubscriberId: newMessagesBySubscriberId ?? prevState.public.messageEventsBySubscriberId,
        };

        dispatch({
          ...prevState,
          lastMessageEventByTopic,
          subscriptionsById,
          subscriberIdsByTopic,
          public: newPublicState,
        });
      },
      setPublisher(id: string, payloads: AdvertiseOptions[]) {
        const snapshot = get();
        const newPublishersById = { ...snapshot.publishersById, [id]: payloads };
        const allPublishers = Lo.flatten(Object.values(newPublishersById));
        snapshot.player?.setPublishers(allPublishers);

        dispatch({
          publishersById: newPublishersById,
          allPublishers,
        });
      },
      /** Update with a player state.
       * Put messages from the player state into messagesBySubscriberId. Any new topic subscribers, receive
       * the last message on a topic. */
      updatePlayerStateAction(action: { playerState: PlayerState; renderDone?: () => void }) {
        const messages = action.playerState.activeData?.messages;
        const prevState = get();

        const seenTopics = new Set<string>();

        // We need a new set of message arrays for each subscriber since downstream users rely
        // on object instance reference checks to determine if there are new messages
        const messagesBySubscriberId = new Map<string, MessageEvent[]>();

        const subscriberIdsByTopic = prevState.subscriberIdsByTopic;

        const lastMessageEventByTopic = prevState.lastMessageEventByTopic;

        // Put messages into per-subscriber queues
        if (messages && messages !== prevState.public.playerState.activeData?.messages) {
          for (const messageEvent of messages) {
            // Save the last message on every topic to send the last message
            // to newly subscribed panels.
            lastMessageEventByTopic.set(messageEvent.topic, messageEvent);

            seenTopics.add(messageEvent.topic);
            const ids = subscriberIdsByTopic.get(messageEvent.topic);
            if (!ids) {
              continue;
            }

            for (const id of ids) {
              const subscriberMessageEvents = messagesBySubscriberId.get(id);
              if (!subscriberMessageEvents) {
                messagesBySubscriberId.set(id, [messageEvent]);
              } else {
                subscriberMessageEvents.push(messageEvent);
              }
            }
          }
        }

        const newPublicState = {
          ...prevState.public,
          playerState: action.playerState,
          messageEventsBySubscriberId: messagesBySubscriberId,
        };
        const topics = action.playerState.activeData?.topics;
        if (topics !== prevState.public.playerState.activeData?.topics) {
          newPublicState.sortedTopics = topics ? [...topics].sort((a, b) => a.name.localeCompare(b.name)) : [];
          if (isConverterChanged()) {
            newPublicState.sortedTopics = newPublicState.sortedTopics.map(topic => {
              const convertibleTo = getSubscribeConvertible(topic.schemaName || "");
              if (convertibleTo.length > 0) {
                topic.convertibleTo = convertibleTo;
              }

              return topic;
            });
          }
        }
        if (action.playerState.activeData?.datatypes !== prevState.public.playerState.activeData?.datatypes) {
          newPublicState.datatypes = action.playerState.activeData?.datatypes ?? new Map();
        }

        const capabilities = action.playerState.capabilities;

        dispatch({
          renderDone: action.renderDone,
          public: newPublicState,
          lastCapabilities: capabilities,
          lastMessageEventByTopic,
        });
      },
      publish(payload: PublishPayload) {
        // @ts-expect-error: throw early
        get().player.publish(payload);
      },
    };
  }
);

/** Given a PlayerState and a PlayerProblem array, add the problems to any existing player problems */
function concatProblems(origState: PlayerState, problems: PlayerProblem[]): PlayerState {
  if (problems.length === 0) {
    return origState;
  }

  return {
    ...origState,
    problems: problems.concat(origState.problems ?? []),
  };
}

export function createPlayerPipe(args: {
  msPerFrame: number;
  promisesToWaitForRef: React.MutableRefObject<FramePromise[]>;
  observable?: Observable<PlayerState>;
}): {
  cleanup: () => void;
} {
  const { msPerFrame, promisesToWaitForRef, observable } = args;
  const messageOrderTracker = new MessageOrderTracker();
  const destroy$ = new Subject$<void>();

  let prevPlayerId: string | undefined;
  let resolveFn: undefined | (() => void);
  const listener = async (listenerPlayerState: PlayerState) => {
    if (resolveFn) {
      throw new Error("New playerState was emitted before last playerState was rendered.");
    }

    // check for any out-of-order or out-of-sync messages
    const problems = messageOrderTracker.update(listenerPlayerState);
    const newPlayerState = concatProblems(listenerPlayerState, problems);

    const promise = new Promise<void>(resolve => {
      resolveFn = () => {
        resolveFn = undefined;
        resolve();
      };
    });

    // Render done is invoked by a layout effect once the component has rendered.
    // After the component renders, we kick off an animation frame to give panels one
    // animation frame to invoke pause.
    let called = false;
    function renderDone() {
      if (called) {
        return;
      }
      called = true;

      const promisesToWaitFor = promisesToWaitForRef.current;
      if (promisesToWaitFor.length > 0) {
        promisesToWaitForRef.current = [];
        pauseFrameForPromises(promisesToWaitFor).finally(() => {
          resolveFn?.();
        });
      } else {
        resolveFn?.();
      }
    }

    if (prevPlayerId != undefined && listenerPlayerState.playerId !== prevPlayerId) {
      MessagePipelineStore.reset();
    }
    prevPlayerId = listenerPlayerState.playerId;

    MessagePipelineStore.updatePlayerStateAction({
      playerState: newPlayerState,
      renderDone,
    });

    await promise;
  };

  let advertised = false,
    lastReceivedTimestamp = -1;
  observable
    ?.pipe(
      takeUntil(destroy$),
      exhaustMap(state => {
        lastReceivedTimestamp = Date.now();
        // avoid advertise too quick to let client cannot get any state
        advertised = state.advertised;

        // if listener slower than frame, we follow the listener's frame
        // else we limit it into msPerFrame
        return RxFrom(listener(state)).pipe(
          delayWhen(() => {
            if (!advertised) return RxOf(null);

            const duration = Date.now() - lastReceivedTimestamp;
            if (duration > msPerFrame) {
              return RxOf(null);
            }

            return RxTimer(msPerFrame - duration);
          })
        );
      })
    )
    .subscribe();

  return {
    cleanup() {
      destroy$.next();
      destroy$.complete();
      resolveFn = undefined;
    },
  };
}

export default MessagePipelineStore;
