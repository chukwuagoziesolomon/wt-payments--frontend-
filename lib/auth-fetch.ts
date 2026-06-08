/**
 * authFetch — drop-in replacement for fetch() that handles 401 / token expiry.
 *
 * On any 401 response it:
 *  1. Clears stored auth tokens from localStorage
 *  2. Dispatches a custom "auth:expired" DOM event (picked up by AuthGuard in the layout)
 *  3. Re-throws so the calling component can bail out of its flow
 */
export async function authFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const res = await fetch(input, init);

  if (res.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken");
      localStorage.removeItem("token");
      window.dispatchEvent(new CustomEvent("auth:expired"));
    }
    throw new AuthExpiredError("Session expired. Please log in again.");
  }

  return res;
}

export class AuthExpiredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthExpiredError";
  }
}
