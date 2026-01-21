import * as base64 from "@protobufjs/base64";
import { parseChannel, ParsedChannel } from "@/utils/mcap";
import { Channel, ChannelId } from "@foxglove/protocol";
import { v4 as uuidv4 } from "uuid";
import { MessageDefinition } from "@foxglove/message-definition";
import { textEncoder } from "./MessageWriter";

type ResolvedChannel = {
  channel: Channel;
  parsedChannel: ParsedChannel;
};
type MessageDefinitionMap = Map<string, MessageDefinition>;

/** manage the schema of the player */
export default class Definer {
  constructor() {}

  #id: string = uuidv4(); // Unique ID for this definer session.
  #channelsById = new Map<ChannelId, ResolvedChannel>();
  #channelsIdBySchemaName = new Map<string, ChannelId>();
  /** Datatypes as published by the WebSocket. */
  #datatypes: MessageDefinitionMap = new Map();

  #unsupportedChannelIds = new Set<ChannelId>();

  parse = (channel: Channel) => {
    let parsedChannel;
    try {
      let schemaEncoding;
      let schemaData;
      if (
        channel.encoding === "json" &&
        (channel.schemaEncoding == undefined || channel.schemaEncoding === "jsonschema")
      ) {
        schemaEncoding = "jsonschema";
        schemaData = textEncoder.encode(channel.schema);
      } else if (
        channel.encoding === "protobuf" &&
        (channel.schemaEncoding == undefined || channel.schemaEncoding === "protobuf")
      ) {
        schemaEncoding = "protobuf";
        schemaData = new Uint8Array(base64.length(channel.schema));
        if (base64.decode(channel.schema, schemaData, 0) !== schemaData.byteLength) {
          throw new Error(`Failed to decode base64 schema on channel ${channel.id}`);
        }
      } else if (
        channel.encoding === "flatbuffer" &&
        (channel.schemaEncoding == undefined || channel.schemaEncoding === "flatbuffer")
      ) {
        schemaEncoding = "flatbuffer";
        schemaData = new Uint8Array(base64.length(channel.schema));
        if (base64.decode(channel.schema, schemaData, 0) !== schemaData.byteLength) {
          throw new Error(`Failed to decode base64 schema on channel ${channel.id}`);
        }
      } else if (
        channel.encoding === "ros1" &&
        (channel.schemaEncoding == undefined || channel.schemaEncoding === "ros1msg")
      ) {
        schemaEncoding = "ros1msg";
        schemaData = textEncoder.encode(channel.schema);
      } else if (
        channel.encoding === "cdr" &&
        (channel.schemaEncoding == undefined || ["ros2idl", "ros2msg", "omgidl"].includes(channel.schemaEncoding))
      ) {
        schemaEncoding = channel.schemaEncoding ?? "ros2msg";
        schemaData = textEncoder.encode(channel.schema);
      } else {
        const msg = channel.schemaEncoding
          ? `Unsupported combination of message / schema encoding: (${channel.encoding} / ${channel.schemaEncoding})`
          : `Unsupported message encoding ${channel.encoding}`;
        throw new Error(msg);
      }
      parsedChannel = parseChannel({
        messageEncoding: channel.encoding,
        schema: {
          name: channel.schemaName,
          encoding: schemaEncoding,
          data: schemaData,
        },
      });
    } catch (error: any) {
      this.#unsupportedChannelIds.add(channel.id);
      throw error;
    }
    const resolvedChannel = { channel, parsedChannel };

    this.#channelsById.set(channel.id, resolvedChannel);
    this.#channelsIdBySchemaName.set(channel.schemaName, channel.id);

    return resolvedChannel;
  };

  delete = (nameOrId: string | ChannelId) => {
    let id: number | undefined = undefined,
      name = "";
    if (typeof nameOrId === "number") {
      // it's id
      id = nameOrId;
    } else {
      id = this.#channelsIdBySchemaName.get(nameOrId);
      name = nameOrId;
    }

    if (id) {
      this.#channelsById.delete(id);
      this.#channelsIdBySchemaName.delete(name);
    }
  };

  clear = () => {
    this.#channelsById.clear();
    this.#channelsIdBySchemaName.clear();
    this.#datatypes = new Map();
  };

  get schemas() {
    return Array.from(this.#channelsById.values(), chanInfo => ({
      topic: chanInfo.channel.topic,
      schemaName: chanInfo.channel.schemaName,
      schema: chanInfo.channel.schema,
    }));
  }
  get channels() {
    return this.#channelsById.values();
  }
  get unsupported() {
    return this.#unsupportedChannelIds;
  }
  get datatypes() {
    return this.#datatypes;
  }
  set datatypes(datatypes: MessageDefinitionMap) {
    this.#datatypes = datatypes;
  }

  getChannelByName = () => {};
  getChannelById = (id: number) => {
    return this.#channelsById.get(id);
  };
  getSchemaByName = () => {};
  getSchemaById = () => {};
}
