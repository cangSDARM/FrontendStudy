export interface MessageWriter {
  writeMessage(message: unknown): Uint8Array;
}

export const textEncoder = new TextEncoder();
export const textDecoder = new TextDecoder();
