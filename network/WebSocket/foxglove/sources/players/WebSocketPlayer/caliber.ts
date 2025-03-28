import { PlayerCapabilities } from "../capabilities";

/** manage the capabilities of the service and the client */
export default class Caliber {
  constructor() {}

  #serverCapabilities: string[] = [];
  #playerCapabilities: (typeof PlayerCapabilities)[keyof typeof PlayerCapabilities][] = [];

  set serverCapabilities(caps: string[]) {
    this.#serverCapabilities = caps;
  }

  judge = (cap: string, judger: "server" | "player") => {
    switch (judger) {
      case "player":
        return this.#playerCapabilities.includes(cap as any);
      case "server":
        return this.#serverCapabilities.includes(cap);
    }
  };

  get playerCapabilities() {
    return this.#playerCapabilities;
  }
  set playerCapabilities(caps: (typeof PlayerCapabilities)[keyof typeof PlayerCapabilities][]) {
    this.#playerCapabilities = caps;
  }
}
