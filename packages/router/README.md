# Router

A lightweight, composition-first frontend router using `URLPattern` and the `History` API.

## Features

- **Standard `URLPattern`**: Leverages the native web platform for route matching.
- **Composition-First**: Functional API designed for composition and middleware.
- **Type-Safe**: Written in TypeScript with generics content support.
- **Framework Agnostic**: Works with vanilla JS or any framework.

## Usage

```typescript
import { createRouter } from "./src/index.ts";

const routes = [
  {
    path: "/",
    handler: async () => "Home Page"
  },
  {
    path: "/users/:id",
    handler: async ({ params }) => `User ID: ${params.id}`
  }
];

const router = createRouter(routes);

// Navigate programmatically
router.navigate("/users/123");

// Listen for browser navigation (popstate)
const cleanup = router.listen();
```

## Middleware

You can use the `compose` function to wrap handlers or middleware logic.

```typescript
import { compose } from "./src/index.ts";

const app = compose(
  loggerMiddleware,
  authMiddleware,
  // ...
);
```
