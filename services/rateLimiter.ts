// services/rateLimiter.ts

// A simple client-side rate limiter to prevent hitting API quotas.

// Configuration: Allow up to 5 API calls per 60 seconds.
const API_CALLS_LIMIT = 5;
const TIME_WINDOW_MS = 60 * 1000;

const callTimestamps: number[] = [];

/**
 * Checks if an API call can be made based on the configured limits.
 * @returns An object indicating if the call is allowed and, if not, when to retry.
 */
export const canMakeApiCall = (): { allowed: boolean; retryAfter: number } => {
    const now = Date.now();

    // Remove timestamps older than the time window
    while (callTimestamps.length > 0 && callTimestamps[0] < now - TIME_WINDOW_MS) {
        callTimestamps.shift();
    }

    if (callTimestamps.length < API_CALLS_LIMIT) {
        return { allowed: true, retryAfter: 0 };
    }

    const oldestCallInWindow = callTimestamps[0];
    const retryAfter = oldestCallInWindow + TIME_WINDOW_MS - now;
    return { allowed: false, retryAfter: Math.ceil(retryAfter / 1000) }; // in seconds
};

/**
 * Records the timestamp of a new API call.
 */
export const recordApiCall = () => {
    callTimestamps.push(Date.now());
};
