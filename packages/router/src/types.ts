/**
 * Context object passed to route handlers.
 * Contains information about the current request/navigation.
 */
export interface RouterContext {
  /** The URL object for the current location. */
  url: URL;
  /**
   * Route parameters extracted from the URL pattern.
   * e.g. for pattern "/users/:id", params might be { id: "123" }
   */
  params: Record<string, string | undefined>;
  /** Query parameters from the URL. */
  query: URLSearchParams;
  /** Optional state object passed via history.pushState. */
  state?: unknown;
}

/**
 * A function that handles a specific route.
 * It receives the RouterContext and returns a result (or Promise of a result).
 */
export type Handler<T = any> = (ctx: RouterContext) => Promise<T> | T;

/**
 * Definition of a route.
 */
export interface Route<T = any> {
  /** The URL pattern to match against (e.g., "/users/:id"). Uses standard URLPattern syntax. */
  path: string;
  /** The handler function to execute when the route matches. */
  handler: Handler<T>;
}
