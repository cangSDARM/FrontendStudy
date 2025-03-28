import { Time } from "@foxglove/rostime";

export function formatFrame({ sec, nsec }: Time): string {
  return `${sec}.${String.prototype.padStart.call(nsec, 9, "0")}`;
}
