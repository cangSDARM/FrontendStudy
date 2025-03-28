import { PromiseTimeoutError, promiseTimeout } from "@/utils/async";

export type FramePromise = { name: string; promise: Promise<void> };

// Wait longer before erroring if there's no user waiting (in automated run)
export const MAX_PROMISE_TIMEOUT_TIME_MS = 5000;

export async function pauseFrameForPromises(promises: FramePromise[]): Promise<void> {
  try {
    await promiseTimeout(
      Promise.all(
        promises.map(async ({ promise }) => {
          await promise;
        })
      ),
      MAX_PROMISE_TIMEOUT_TIME_MS
    );
  } catch (error) {
    const isTimeoutError = error instanceof PromiseTimeoutError;
    if (!isTimeoutError) {
      throw "An async render task failed to finish in time; some panels may display data from the wrong frame";
    }
  }
}
