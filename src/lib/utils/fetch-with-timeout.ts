/**
 * Fetch with timeout utility
 * 
 * Wraps fetch with AbortController to enforce timeout.
 * Throws error if request exceeds timeout duration.
 */

export class FetchTimeoutError extends Error {
  constructor(url: string, timeout: number) {
    super(`Request to ${url} timed out after ${timeout}ms`);
    this.name = "FetchTimeoutError";
  }
}

export interface FetchWithTimeoutOptions extends RequestInit {
  timeout?: number; // Timeout in milliseconds
}

/**
 * Fetch with automatic timeout handling
 * 
 * @param url - URL to fetch
 * @param options - Fetch options including custom timeout
 * @returns Promise<Response>
 * @throws FetchTimeoutError if request exceeds timeout
 * 
 * @example
 * ```typescript
 * try {
 *   const response = await fetchWithTimeout('/api/endpoint', {
 *     timeout: 5000, // 5 seconds
 *     method: 'POST',
 *     body: JSON.stringify(data),
 *   });
 *   const result = await response.json();
 * } catch (error) {
 *   if (error instanceof FetchTimeoutError) {
 *     console.error('Request timed out');
 *   }
 * }
 * ```
 */
export async function fetchWithTimeout(
  url: string | URL,
  options: FetchWithTimeoutOptions = {}
): Promise<Response> {
  const { timeout = 30000, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);

    // Check if error is due to abort (timeout)
    if (error instanceof Error && error.name === "AbortError") {
      throw new FetchTimeoutError(url.toString(), timeout);
    }

    // Re-throw other errors
    throw error;
  }
}

/**
 * Retry fetch with exponential backoff
 * 
 * @param url - URL to fetch
 * @param options - Fetch options
 * @param maxRetries - Maximum number of retries (default: 3)
 * @param baseDelay - Base delay in ms for exponential backoff (default: 1000)
 * @returns Promise<Response>
 * 
 * @example
 * ```typescript
 * const response = await fetchWithRetry('/api/endpoint', {
 *   timeout: 5000,
 *   method: 'GET',
 * }, 3); // Retry up to 3 times
 * ```
 */
export async function fetchWithRetry(
  url: string | URL,
  options: FetchWithTimeoutOptions = {},
  maxRetries = 3,
  baseDelay = 1000
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetchWithTimeout(url, options);

      // Retry on 5xx server errors and 429 rate limit
      if (response.status >= 500 || response.status === 429) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on timeout or client errors (4xx except 429)
      if (
        error instanceof FetchTimeoutError ||
        (error instanceof Error && error.message.startsWith("HTTP 4"))
      ) {
        throw error;
      }

      // Wait before retry with exponential backoff
      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error("Fetch failed after retries");
}
