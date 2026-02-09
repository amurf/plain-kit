import { describe, it } from "node:test";
import assert from "node:assert";
import { createRouter, compose, createMemoryHistory } from "../src/index.ts";
import type { Route, RouterContext } from "../src/types.ts";

// Polyfill URLPattern if needed (Node 24 has it globally, but for safety in older envs if any)
if (!globalThis.URLPattern) {
  // Assuming the user environment has it or we are on Node 25+
  // But wait, the previous code didn't polyfill URLPattern, it just mocked window.
  // The user said they match "Node 24 Native Modernization".
}

describe("Router Example Tests", () => {
  const authMiddleware = async (
    ctx: RouterContext,
    next: () => Promise<any>,
  ) => {
    if (ctx.url.searchParams.get("auth") === "false") {
      return { status: 401, body: "Unauthorized" };
    }
    return next();
  };

  const loggerMiddleware = async (
    ctx: RouterContext,
    next: () => Promise<any>,
  ) => {
    const start = Date.now();
    const res = await next();
    const ms = Date.now() - start;
    return res;
  };

  const routes: Route[] = [
    {
      path: "/users/:id",
      handler: async (ctx) => {
        return `User Page: ${ctx.params.id}`;
      },
    },
    {
      path: "/",
      handler: async () => {
        return "Home Page";
      },
    },
  ];

  const history = createMemoryHistory("/");
  const router = createRouter(routes, { history });

  it("should match initial route", async () => {
    // history starts at /
    const result = await router.resolve(history.location.href);
    assert.strictEqual(result, "Home Page");
  });

  it("should navigate to /users/123", async () => {
    router.navigate("/users/123");
    const result = await router.resolve(history.location.href);
    assert.strictEqual(result, "User Page: 123");
  });

  it("should handle middleware composition (auth=false)", async () => {
    const app = compose(loggerMiddleware, authMiddleware, async (ctx) => {
      return "Success";
    });

    const ctx = {
      url: new URL("http://localhost/users/456?auth=false"),
      params: {},
      query: new URLSearchParams("auth=false"),
    } as any;

    const result = await app(ctx);
    assert.deepStrictEqual(result, { status: 401, body: "Unauthorized" });
  });

  it("should handle middleware composition (auth=true)", async () => {
    const app = compose(loggerMiddleware, authMiddleware, async (ctx) => {
      return "Success";
    });

    const ctx = {
      url: new URL("http://localhost/users/456?auth=true"),
      params: {},
      query: new URLSearchParams("auth=true"),
    } as any;

    const result = await app(ctx);
    assert.strictEqual(result, "Success");
  });
});
