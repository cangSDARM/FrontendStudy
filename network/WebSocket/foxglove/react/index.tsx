import { MessageEvent } from "@/sources/players/types";
import MessagePipelineStore, { MessagePipelineState } from "@/store/message";
import ConvertStore, { publishConvert, subscribeConvert } from "@/store/converter";
import { buildMessageFromTopic } from "@/utils/buildMessage";
import { RosDatatypes } from "@/utils/rosDatatypesToMessageDefinition";
import { PlayerCapabilities } from "@/sources/players/capabilities";

export { usePlayerSelection } from "./PlayerSelectionContext";
export { default as FoxgloveSocketProvider } from "./Provider";

export const FoxgloveContext = {
  sub: {
    update: MessagePipelineStore.setSubscriptions,
    cleanById: (id: string) => MessagePipelineStore.setSubscriptions({ id, payloads: [] }),
    messagesByIdSync: (id: string, fn: (messages?: MessageEvent[]) => void) =>
      MessagePipelineStore.subscribe(() => {
        const messages = MessagePipelineStore.getSnapshot().public.messageEventsBySubscriberId.get(id);
        const converted = messages?.map(msg => subscribeConvert(msg)).flat(1);
        fn(converted);
      }, ["public"]),
    playerStateSync: (fn: (state: MessagePipelineState["public"]["playerState"]) => void) => {
      fn(MessagePipelineStore.getSnapshot().public.playerState);

      return MessagePipelineStore.subscribe(() => {
        fn(MessagePipelineStore.getSnapshot().public.playerState);
      }, ["public.playerState"]);
    },
    topicsSync: (fn: (state: MessagePipelineState["public"]["sortedTopics"]) => void) => {
      fn(MessagePipelineStore.getSnapshot().public.sortedTopics);

      return MessagePipelineStore.subscribe(() => {
        fn(MessagePipelineStore.getSnapshot().public.sortedTopics);
      }, ["public.sortedTopics"]);
    },
  },
  convert: {
    set: ConvertStore.setConverter,
    clean: ConvertStore.cleanConverter,
  },
  pub: {
    getPublishable(topic: string) {
      const snapshot = MessagePipelineStore.getSnapshot();

      return buildMessageFromTopic(snapshot.public.sortedTopics, snapshot.public.datatypes)(topic);
    },
    /**
     * Registers a publisher with the player and returns a publish() function to publish data.
     *
     * You should call the `cleanup` when you don't want publish any more
     */
    register({
      topic,
      schemaName,
      datatypes,
      id,
    }: {
      topic: string;
      schemaName: string;
      datatypes?: RosDatatypes;
      id: string;
    }) {
      const snapshot = MessagePipelineStore.getSnapshot();
      const ret = {
        /** publish data */
        publish: (() => void 0) as typeof MessagePipelineStore.publish,
        /** You should call the `cleanup` when you don't want publish any more */
        cleanup: (() => void 0) as () => void,
        /** `==true` if and only if player have the `advertise` capability */
        canPublish: snapshot.public.playerState.capabilities.includes(PlayerCapabilities.advertise),
      };
      if (ret.canPublish && topic && schemaName) {
        MessagePipelineStore.setPublisher(id, [{ topic, schemaName, options: { datatypes } }]);
        ret.publish = payload => {
          MessagePipelineStore.publish(publishConvert(payload));
        };
        ret.cleanup = () => {
          MessagePipelineStore.setPublisher(id, []);
        };
      }

      return ret;
    },
  },
};
