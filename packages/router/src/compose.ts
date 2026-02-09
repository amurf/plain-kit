import type { RouterContext } from "./types.ts";

export type Middleware<T = any> = (
  ctx: RouterContext,
  next: () => Promise<T>,
) => Promise<T> | T;

/**
 * Composes multiple middleware functions into a single handler.
 * Middleware are executed in order (onion model).
 * @param middleware - Functions to compose.
 * @returns A single handler function that executes the middleware chain.
 * @example
 * const handler = compose(
 *   async (ctx, next) => {
 *     console.log("Before");
 *     const res = await next();
 *     console.log("After");
 *     return res;
 *   },
 *   finalHandler
 * );
 */
export const compose = <T = any>(...middleware: Middleware<T>[]) => {
  return (ctx: RouterContext, next?: () => Promise<T>): Promise<T> => {
    let index = -1;
    function dispatch(i: number): Promise<T> {
      if (i <= index)
        return Promise.reject(new Error("next() called multiple times"));
      index = i;
      let fn = middleware[i];

      if (i === middleware.length) fn = next as Middleware<T>;

      if (!fn) return Promise.resolve() as Promise<T>; // Default to resolving undefined/void if no more middleware

      try {
        return Promise.resolve(fn(ctx, dispatch.bind(null, i + 1)));
      } catch (err) {
        return Promise.reject(err);
      }
    }
    return dispatch(0);
  };
};
