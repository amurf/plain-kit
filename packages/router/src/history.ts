export interface History {
    readonly location: URL;
    push(path: string, state?: any): void;
    replace(path: string, state?: any): void;
    listen(listener: () => void): () => void;
}

export const createBrowserHistory = (): History => {
    if (typeof window === "undefined") {
        throw new Error("createBrowserHistory can only be used in a browser environment");
    }

    const listeners = new Set<() => void>();

    const notify = () => {
        for (const listener of listeners) {
            listener();
        }
    };

    window.addEventListener("popstate", notify);

    return {
        get location() {
            return new URL(window.location.href);
        },
        push(path: string, state?: any) {
            window.history.pushState(state, "", path);
            notify();
        },
        replace(path: string, state?: any) {
            window.history.replaceState(state, "", path);
            notify();
        },
        listen(listener: () => void) {
            listeners.add(listener);
            return () => {
                listeners.delete(listener);
                if (listeners.size === 0) {
                    window.removeEventListener("popstate", notify);
                }
            };
        },
    };
};

export const createMemoryHistory = (initialPath = "/"): History => {
    let currentLocation = new URL(initialPath, "http://localhost");
    const listeners = new Set<() => void>();

    const notify = () => {
        for (const listener of listeners) {
            listener();
        }
    };

    return {
        get location() {
            return currentLocation;
        },
        push(path: string, _state?: any) {
            currentLocation = new URL(path, currentLocation.origin);
            notify();
        },
        replace(path: string, _state?: any) {
            currentLocation = new URL(path, currentLocation.origin);
            notify();
        },
        listen(listener: () => void) {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
    };
};
