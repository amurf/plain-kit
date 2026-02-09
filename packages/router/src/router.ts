import type { Route, RouterContext, Handler } from "./types.ts";
import { type History, createBrowserHistory } from "./history.ts";

interface CompiledRoute<T> {
  pattern: URLPattern;
  handler: Handler<T>;
}

export interface Router<T = any> {
  /**
   * Resolves a URL to a handler result.
   * @param url - The full URL or path string to resolve.
   * @returns The result of the matched handler, or undefined if no match found.
   */
  resolve: (url: string | URL) => Promise<T | undefined>;
  /**
   * Navigates to a new path using the History API and triggers resolution.
   * @param path - The path to navigate to.
   */
  navigate: (path: string) => void;
  /**
   * Starts listening to history changes (popstate).
   * @returns A function to stop listening (unsubscribe).
   */
  listen: () => () => void;
}

export interface RouterOptions {
  history?: History;
}

/**
 * Creates a new Router instance with the given routes.
 * @param routes - An array of route definitions.
 * @param options - Optional configuration object.
 * @returns A Router instance with resolve, navigate, and listen methods.
 * @example
 * const router = createRouter([
 *   { path: "/", handler: () => "Home" },
 *   { path: "/users/:id", handler: ({ params }) => `User ${params.id}` }
 * ]);
 */
export const createRouter = <T = any>(
  routes: Route<T>[],
  options: RouterOptions = {}
): Router<T> => {
  const history = options.history ?? createBrowserHistory();

  const compiledRoutes: CompiledRoute<T>[] = routes.map((route) => ({
    pattern: new URLPattern({ pathname: route.path }),
    handler: route.handler,
  }));

  const resolve = async (url: string | URL): Promise<T | undefined> => {
    const urlObj =
      typeof url === "string" ? new URL(url, "http://localhost") : url;

    for (const { pattern, handler } of compiledRoutes) {
      const match = pattern.exec(urlObj);
      if (match) {
        const ctx: RouterContext = {
          url: urlObj,
          params: match.pathname.groups || {},
          query: urlObj.searchParams,
        };
        return handler(ctx);
      }
    }
    return undefined;
  };

  const navigate = (path: string) => {
    history.push(path);
    // history.push triggers the listener, but we might want to manually resolve if not using the listener loop yet?
    // Actually, typical router behavior is: navigate -> update history -> listener fires -> resolve.
    // But createRouter returns `listen` which the user must call.
    // If the user hasn't called listen, navigation won't trigger a re-render/resolve automatically unless we force it.
    // Let's mimic the previous behavior: navigate pushes state AND we might want to return something?
    // The previous implementation did: pushState -> resolve.
    // But here resolve is async and navigate is void.
    // Let's stick to history.push(). If the user wants to react, they should set up a listener.
    // However, for consistency with the previous implementation which called resolve() immediately...
    // The previous implementation:
    // const navigate = (path: string) => {
    //   window.history.pushState({}, "", path);
    //   resolve(window.location.href);
    // };
    // The resolve result was ignored though.
  };

  const listen = () => {
    // Initial resolution
    resolve(history.location.href);

    return history.listen(() => {
      resolve(history.location.href);
    });
  };

  return { resolve, navigate, listen };
};
