import { signal, computed, effect } from "@plain-kit/signals";

export type QueryState<T> = {
    data: T | null;
    error: Error | null;
    isLoading: boolean;
};

export type QueryOptions<T> = {
    initialData?: T;
    enabled?: boolean;
};

export function createQuery<T>(
    fetcher: () => Promise<T>,
    options: QueryOptions<T> = {}
) {
    const data = signal<T | null>(options.initialData ?? null);
    const error = signal<Error | null>(null);
    const isLoading = signal<boolean>(true);
    const enabled = signal<boolean>(options.enabled ?? true);

    const execute = async () => {
        if (!enabled.get()) return;

        isLoading.set(true);
        error.set(null);

        try {
            const result = await fetcher();
            data.set(result);
        } catch (err) {
            error.set(err instanceof Error ? err : new Error(String(err)));
        } finally {
            isLoading.set(false);
        }
    };

    effect(() => {
        if (enabled.get()) {
            execute();
        }
    });

    const state = computed(() => ({
        data: data.get(),
        error: error.get(),
        isLoading: isLoading.get(),
    }));

    return {
        state,
        refetch: execute,
    };
}
