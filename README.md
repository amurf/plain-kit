# Plain Kit

A modular, framework-less frontend stack inspired by functional programming and composition.

This repository is a monorepo managed with npm workspaces, containing a suite of small, single-purpose packages designed to work together or independently.

## Packages

### [`@plain-kit/signals`](./packages/signals)

A minimal, fine-grained reactivity library.

```ts
import { signal, computed, effect } from "@plain-kit/signals";

const count = signal(0);
const double = computed(() => count.get() * 2);

effect(() => {
  console.log(`Count: ${count.get()}, Double: ${double.get()}`);
});

count.set(1); // Logs: "Count: 1, Double: 2"
```

### [`@plain-kit/http`](./packages/http)

A functional HTTP client wrapper with middleware support.

```ts
import { createClient, compose } from "@plain-kit/http";

const client = createClient(
  compose(
    withAuth(token),
    withBaseUrl("/api")
  )
);

await client.get("/users");
```

### [`@plain-kit/query`](./packages/query)

Async state management powered by signals.

```ts
import { createQuery } from "@plain-kit/query";

const { state, refetch } = createQuery(() => fetch("/api/data").then(r => r.json()));

effect(() => {
  const { data, isLoading, error } = state.get();
  if (data) console.log("Data:", data);
});
```

### [`@plain-kit/router`](./packages/router)

A lightweight, framework-agnostic router using the native `URLPattern` API.

```ts
import { createRouter } from "@plain-kit/router";

const router = createRouter([
  { path: "/", handler: () => "Home" },
  { path: "/users/:id", handler: ({ params }) => `User ${params.id}` }
]);

const result = await router.resolve("/users/123");
```

## Development

- **Install dependencies**: `npm install`
- **Run tests**: `npm test -ws` (runs tests in all workspaces)

## Contributing

See individual package directories for more details on their specific implementations and tests.
