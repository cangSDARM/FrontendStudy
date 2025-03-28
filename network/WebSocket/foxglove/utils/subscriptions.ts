// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

// import moize from "moize";
import Lo from "lodash";

import { Immutable } from "@/immutable";
import { SubscribePayload } from "@/sources/players/types";

/**
 * Create a deep equal memoized identify function. Used for stabilizing the subscription payloads we
 * send on to the player.
 *
 * Note that this has unlimited cache size so it should be managed by some containing scope.
 */
// export function makeSubscriptionMemoizer(): (val: SubscribePayload) => SubscribePayload {
//   return moize((val: SubscribePayload) => val, { isDeepEqual: true, maxSize: Infinity });
// }

/**
 * Merge two SubscribePayloads, using either all of the fields or the union of
 * the specific fields requested.
 */
function mergeSubscription(
  a: Immutable<SubscribePayload>,
  b: Immutable<SubscribePayload>
): Immutable<SubscribePayload> {
  const isAllFields = a.fields == undefined || b.fields == undefined;
  const fields = Lo.chain([a, b])
    .flatMap(payload => payload.fields ?? [])
    .map(v => v.trim())
    .filter(v => v.length > 0)
    .uniq()
    .value();

  return {
    ...a,
    fields: fields.length > 0 && !isAllFields ? fields : undefined,
  };
}

/**
 * Merge subscriptions that subscribe to the same topic, paying attention to
 * the fields they need. This ignores `preloadType`.
 */
function denormalizeSubscriptions(subscriptions: Immutable<SubscribePayload[]>): Immutable<SubscribePayload[]> {
  return Lo.chain(subscriptions)
    .groupBy(v => v.topic)
    .values()
    .filter(payloads => {
      // Handle this later
      if (payloads == undefined) {
        return true;
      }

      return !payloads.every(v => v.fields != undefined && v.fields.length === 0);
    })
    .flatMap(payloads => {
      const first = payloads?.[0];
      if (payloads == undefined || first == undefined || payloads.length === 0) {
        return [];
      }

      return payloads.reduce((prev, cur) => mergeSubscription(prev, cur), first);
    })
    .value();
}

/**
 * Merges individual topic subscriptions into a set of subscriptions to send on to the player.
 *
 * If any client requests a "whole" subscription to a topic then all fields will be fetched for that
 * topic. If various clients request different slices of a topic then we request the union of all
 * requested slices.
 */
export function mergeSubscriptions(subscriptions: Immutable<SubscribePayload[]>): Immutable<SubscribePayload[]> {
  const [full, partial] = Lo.chain(subscriptions)
    .flatMap((v): Immutable<SubscribePayload>[] => {
      const { preloadType } = v;
      if (preloadType !== "full") {
        return [v];
      }

      // a "full" subscription to all fields implies a "partial" subscription to those fields, too
      return [v, { ...v, preloadType: "partial" }];
    })
    .partition(v => v.preloadType === "full")
    .value();

  return [...denormalizeSubscriptions(full), ...denormalizeSubscriptions(partial)];
}
