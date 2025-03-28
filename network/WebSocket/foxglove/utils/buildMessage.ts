import { Immutable } from "@/immutable";
import { RosDatatypes } from "./rosDatatypesToMessageDefinition";
import { Topic } from "@/sources/players/types";

export const builtinSampleValues: Record<string, unknown> = {
  bool: false,
  int8: 0,
  uint8: 0,
  int16: 0,
  uint16: 0,
  int32: 0,
  uint32: 0,
  int64: 0,
  uint64: 0,
  float32: 0,
  float64: 0,
  string: "",
  time: { sec: 0, nsec: 0 },
  duration: { sec: 0, nsec: 0 },
};

function buildMessage(datatypes: Immutable<RosDatatypes>, datatype: string): unknown {
  const builtin = builtinSampleValues[datatype];
  if (builtin != undefined) {
    return builtin;
  }
  const fields = datatypes.get(datatype)?.definitions;
  if (!fields) {
    return undefined;
  }
  const obj: Record<string, unknown> = {};
  for (const field of fields) {
    if (field.isConstant ?? false) {
      continue;
    }
    const sample = buildMessage(datatypes, field.type);
    if (field.isArray ?? false) {
      if (field.arrayLength != undefined) {
        obj[field.name] = new Array(field.arrayLength).fill(sample);
      } else {
        obj[field.name] = [sample];
      }
    } else {
      obj[field.name] = sample;
    }
  }
  return obj;
}

export const getMessage = (datatypes: Immutable<RosDatatypes>, datatype?: string): any | undefined => {
  if (datatype == undefined) {
    return undefined;
  }
  const sampleMessage = buildMessage(datatypes, datatype);
  return sampleMessage != undefined ? sampleMessage : {};
};

export const buildMessageFromTopic = (topics: Topic[], datatypes: Immutable<RosDatatypes>) => (topic: string) => {
  const draft = {
    topicName: "",
    datatype: "",
    value: "",
  };
  const topicSchemaName = topics.find(t => t.name === topic)?.schemaName;
  const sampleMessage = getMessage(datatypes, topicSchemaName);

  draft.topicName = topic;

  if (topicSchemaName) {
    draft.datatype = topicSchemaName;
  }
  if (sampleMessage) {
    draft.value = sampleMessage;
  }

  return draft;
};
