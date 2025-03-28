import Lo from "lodash";
import { Opaque } from "ts-essentials";
import { Immutable } from "@/immutable";
import { newStore } from "@tool-sets/state";
import { MessageEvent, PublishPayload } from "@/sources/players/types";

export type ConvertStage = "publish" | "subscribe";
type ConverterKey = Opaque<string, "ConverterKey">;

export type SubscribeConverter<Src = unknown> = {
  name: string;
  fromSchemaName: string;
  toSchemaName: string;
  converter: (msg: Src, event: Immutable<MessageEvent>) => unknown;
};
export type PublishConverter<Src = unknown> = {
  name: string;
  topic: string;
  converter: (msg: Src, event: Immutable<PublishPayload>) => unknown;
};

const log = window.console;

// Create a string lookup key from a message event
//
// The string key uses a newline delimeter to avoid producting the same key for topic/schema name
// values that might concatenate to the same string. i.e. "topic" "schema" and "topics" "chema".
function converterKey(schema: string, stage: ConvertStage): ConverterKey {
  return (schema + "\n" + stage) as ConverterKey;
}

/**
 * Returns a new map consisting of all items in `a` not present in `b`.
 */
export function mapDifference<K, V>(a: Map<K, V[]>, b: undefined | Map<K, V[]>): Map<K, V[]> {
  const result = new Map<K, V[]>();
  for (const [key, value] of a.entries()) {
    const newValues = Lo.difference(value, b?.get(key) ?? []);
    if (newValues.length > 0) {
      result.set(key, newValues);
    }
  }
  return result;
}

const ConverterStore = newStore(
  {
    subConverterChanged: true,
    pubConverterChanged: true,
    subConverters: new Map<ConverterKey, SubscribeConverter[]>(),
    pubConverters: new Map<ConverterKey, PublishConverter>(),
  },
  ({ get, dispatch }) => {
    return {
      setConverter: (converter: SubscribeConverter | PublishConverter) => {
        if (!converter.name) {
          log.error("Due to the missing name, the converter will be ignored.", converter);

          return;
        }

        const stage: ConvertStage | "unknown" = (converter as PublishConverter).topic
          ? "publish"
          : (converter as SubscribeConverter).fromSchemaName
            ? "subscribe"
            : "unknown";
        if (stage === "unknown") {
          throw new ReferenceError('Cannot set unknown converter, missing "topic" or "fromSchemaName"!');
        }

        const snapshot = get();

        let stageConverters: Map<ConverterKey, any>;
        let key: ConverterKey;
        switch (stage) {
          case "publish": {
            key = converterKey((converter as PublishConverter).topic, stage);
            stageConverters = snapshot.pubConverters;
            const oldConverter = stageConverters.get(key);
            if (oldConverter) {
              log.error(
                "There is already a converter(name: %s) for the topic(%s), this one will be ignored.",
                oldConverter.name,
                (converter as PublishConverter).topic
              );
            } else {
              stageConverters.set(key, converter);
              dispatch({
                pubConverterChanged: true,
                pubConverters: stageConverters,
              });
            }
            break;
          }
          case "subscribe": {
            key = converterKey((converter as SubscribeConverter).fromSchemaName, stage);
            stageConverters = snapshot.subConverters;
            const oldConverters = stageConverters.get(key) || [];
            const oldConverterIdx = oldConverters.findIndex(
              (cov: SubscribeConverter) =>
                cov.fromSchemaName === (converter as SubscribeConverter).fromSchemaName &&
                cov.toSchemaName === (converter as SubscribeConverter).toSchemaName
            );
            if (oldConverterIdx >= 0) {
              log.error(
                "There is already a converter(name: %s) from the source to the target, this one will be ignored.",
                oldConverters[oldConverterIdx].name
              );

              return;
            }
            stageConverters.set(key, oldConverters.concat(converter as SubscribeConverter));

            dispatch({
              pubConverterChanged: true,
              subConverters: stageConverters,
            });
            break;
          }
        }
      },
      cleanConverter: (topicOrSchema: string, stage: ConvertStage) => {
        const snapshot = get();
        switch (stage) {
          case "subscribe":
            snapshot.subConverters.set(converterKey(topicOrSchema, stage), []);
            snapshot.subConverterChanged = true;
            break;
          case "publish":
            snapshot.pubConverters.delete(converterKey(topicOrSchema, stage));
            snapshot.pubConverterChanged = true;
            break;
          default:
            log.error("try to clean unknown stage:", stage);
        }

        dispatch(snapshot);
      },
      checked: () => {
        dispatch({ pubConverterChanged: false, subConverterChanged: false });
      },
    };
  }
);

export const isConverterChanged = () => {
  const { pubConverterChanged, subConverterChanged } = ConverterStore.getSnapshot();
  const changed = pubConverterChanged || subConverterChanged;

  ConverterStore.checked();

  return changed;
};

export const getSubscribeConvertible = (schemaName: string) => {
  const key = converterKey(schemaName, "subscribe");
  const matchedConverters = ConverterStore.getSnapshot().subConverters.get(key);
  const convertibleTo: string[] = [];
  if (!matchedConverters) return [];

  for (const converter of matchedConverters) {
    if (converter.fromSchemaName === schemaName) {
      if (!convertibleTo.includes(converter.toSchemaName)) {
        convertibleTo.push(converter.toSchemaName);
      }
    }
  }

  return convertibleTo;
};

export const subscribeConvert = (messageEvent: MessageEvent) => {
  const key = converterKey(messageEvent.schemaName, "subscribe");
  const matchedConverters = ConverterStore.getSnapshot().subConverters.get(key);
  const convertedMessages: MessageEvent[] = [];

  if (!matchedConverters) {
    return [messageEvent];
  }

  let sourceShemaSkipped = true;
  for (const converter of matchedConverters) {
    const converted = converter.converter(messageEvent.message, messageEvent);
    if (converted == undefined) {
      continue;
    }
    if (converter.toSchemaName === messageEvent.schemaName) {
      if (sourceShemaSkipped) sourceShemaSkipped = false;
      // shouldn't happen
      else continue;
    }

    convertedMessages.push({
      topic: messageEvent.topic,
      schemaName: converter.toSchemaName,
      receiveTime: messageEvent.receiveTime,
      message: converted,
      originalMessageEvent: messageEvent,
      sizeInBytes: messageEvent.sizeInBytes,
      effectedBy: [converter.name],
    });
  }
  if (sourceShemaSkipped) {
    convertedMessages.push(messageEvent);
  }

  return convertedMessages;
};

export const publishConvert = (messagePayload: PublishPayload) => {
  const key = converterKey(messagePayload.topic, "publish");
  const matchedConverter = ConverterStore.getSnapshot().pubConverters.get(key);

  let convertedMessages: PublishPayload | undefined = undefined;
  if (matchedConverter) {
    const converted = matchedConverter.converter(messagePayload.msg, messagePayload);
    if (converted) {
      convertedMessages = {
        topic: messagePayload.topic,
        msg: converted as any,
      };
      return convertedMessages;
    }
  }

  return messagePayload;
};

export default ConverterStore;
