import { IWebSocket } from "@gviz/ws-manage";

import { FromWorkerMessage, ToWorkerMessage } from "./worker";

export default class WorkerSocketAdapter implements IWebSocket {
  #worker: Worker;
  #connectionClosed: boolean = false;
  public binaryType: string = "";
  public protocol: string = "";
  public onerror: ((event: unknown) => void) | undefined = undefined;
  public onopen: ((event: unknown) => void) | undefined = undefined;
  public onclose: ((event: unknown) => void) | undefined = undefined;
  public onmessage: ((event: unknown) => void) | undefined = undefined;

  public constructor(wsUrl: string, protocols?: string[] | string) {
    this.#worker = new Worker(new URL("./worker", import.meta.url));
    this.#sendToWorker({ type: "open", data: { wsUrl, protocols } });

    this.#worker.onerror = ev => {
      if (this.onerror) {
        this.onerror(ev);
      }
    };

    this.#worker.onmessage = (event: MessageEvent<FromWorkerMessage>) => {
      switch (event.data.type) {
        case "open":
          if (this.onopen) {
            this.protocol = event.data.protocol;
            this.onopen(event.data);
          }
          break;
        case "close":
          // websocket connection got closed, we can terminate the worker
          this.#connectionClosed = true;
          this.#worker.terminate();

          if (this.onclose) {
            this.onclose(event.data);
          }
          break;
        case "error":
          if (this.onerror) {
            this.onerror(event.data);
          }
          break;
        case "message":
          if (this.onmessage) {
            this.onmessage(event.data);
          }
          break;
      }
    };
  }

  public close(): void {
    if (!this.#connectionClosed) {
      this.#sendToWorker({
        type: "close",
        data: undefined,
      });
    }
  }

  public send(data: string | ArrayBuffer | ArrayBufferView): void {
    this.#sendToWorker({ type: "data", data });
  }

  #sendToWorker(msg: ToWorkerMessage): void {
    if (this.#connectionClosed) {
      throw Error("Can't send message over closed websocket connection");
    }
    this.#worker.postMessage(msg);
  }
}
