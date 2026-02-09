import { test } from "node:test";
import assert from "node:assert";
import { createQuery } from "../src/index.ts";
import { signal } from "@plain-kit/signals";

test("createQuery - basic fetch", async () => {
    const fetcher = async () => "success";
    const { state } = createQuery(fetcher);

    // Initial state might be loading or null depending on timing, 
    // but effect runs async so initially it should be loading=true
    assert.strictEqual(state.get().isLoading, true);
    assert.strictEqual(state.get().data, null);
    assert.strictEqual(state.get().error, null);

    // Wait for promise resolution (microtask)
    await new Promise((resolve) => setTimeout(resolve, 10));

    assert.strictEqual(state.get().isLoading, false);
    assert.strictEqual(state.get().data, "success");
    assert.strictEqual(state.get().error, null);
});

test("createQuery - error handling", async () => {
    const fetcher = async () => {
        throw new Error("fail");
    };
    const { state } = createQuery(fetcher);

    assert.strictEqual(state.get().isLoading, true);

    await new Promise((resolve) => setTimeout(resolve, 10));

    assert.strictEqual(state.get().isLoading, false);
    assert.strictEqual(state.get().data, null);
    assert.strictEqual(state.get().error?.message, "fail");
});

test("createQuery - refetch", async () => {
    let counter = 0;
    const fetcher = async () => {
        counter++;
        return counter;
    };

    const { state, refetch } = createQuery(fetcher);

    await new Promise((resolve) => setTimeout(resolve, 10));
    assert.strictEqual(state.get().data, 1);

    await refetch();
    // refetch is async but we await it here if we returned it, 
    // actually our implementation of execute is async, but createQuery returns it as refetch.
    // wait a bit to be sure
    await new Promise((resolve) => setTimeout(resolve, 10));

    assert.strictEqual(state.get().data, 2);
});
