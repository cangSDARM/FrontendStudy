import { MessageWriter, textEncoder } from "./MessageWriter";

export class JsonMessageWriter implements MessageWriter {
  public writeMessage(message: unknown): Uint8Array {
    return textEncoder.encode(JSON.stringify(message) ?? "");
  }
}
