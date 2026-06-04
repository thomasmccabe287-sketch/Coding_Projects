/**
 * Global serial request queue — only one API call runs at a time.
 * Prevents rate-limit bursts when multiple components mount simultaneously.
 *
 * KEY BEHAVIOUR: When any request hits a 429, a SHARED global backoff timer
 * is set. All subsequent queued requests wait for that same timer to expire
 * before starting — so they don't each pay an independent 8-second penalty.
 */

let queue = Promise.resolve();

// Shared across all requests — set when any 429 is received
let globalBackoffUntil = 0;

function isRateLimitError(err) {
  return (
    err?.status === 429 ||
    err?.response?.status === 429 ||
    String(err?.message).includes("429") ||
    String(err?.message).toLowerCase().includes("rate limit") ||
    String(err?.message).toLowerCase().includes("too many requests")
  );
}

function waitUntil(ts) {
  const remaining = ts - Date.now();
  if (remaining <= 0) return Promise.resolve();
  return new Promise(res => setTimeout(res, remaining));
}

/**
 * Wraps an API call so it:
 * 1. Waits for all previously enqueued calls to finish (global serial queue)
 * 2. Waits for any active global rate-limit cooldown before starting
 * 3. On 429, sets/extends the global backoff (shared by all queued requests)
 * 4. Retries with exponential backoff (up to `retries` attempts)
 */
export function fetchWithRetry(fn, retries = 4, baseDelay = 600) {
  const chained = queue.then(async () => {
    // Honour any global rate-limit cooldown set by a previous request
    await waitUntil(globalBackoffUntil);

    let lastErr;

    for (let i = 0; i < retries; i++) {
      try {
        const result = await fn();
        // Small inter-request pause to stay below rate limit
        await new Promise(res => setTimeout(res, 150));
        return result;
      } catch (err) {
        lastErr = err;
        if (i < retries - 1) {
          if (isRateLimitError(err)) {
            // Extend the global backoff — all other queued requests will share this wait
            const cooldown = 12000 * (i + 1); // 12s, then 24s on repeated failures
            globalBackoffUntil = Math.max(globalBackoffUntil, Date.now() + cooldown);
            console.warn(
              `[fetchWithRetry] 429 received. Global backoff set for ${cooldown / 1000}s.`
            );
            await waitUntil(globalBackoffUntil);
          } else {
            // Non-rate-limit error: simple exponential backoff for this request only
            const waitMs = baseDelay * Math.pow(2, i);
            console.warn(
              `[fetchWithRetry] Attempt ${i + 1} failed. Retrying in ${waitMs}ms.`,
              err?.message || err
            );
            await new Promise(res => setTimeout(res, waitMs));
          }
        }
      }
    }

    throw lastErr;
  });

  // Advance the shared queue; swallow errors so the chain never breaks
  queue = chained.then(() => {}, () => {});
  return chained;
}