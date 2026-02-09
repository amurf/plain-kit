import { createRouter, createMemoryHistory, createBrowserHistory } from "@plain-kit/router";
import { signal, computed, effect } from "@plain-kit/signals";
import { createQuery } from "@plain-kit/query";
import { createClient } from "@plain-kit/http"; // Assuming createClient is exported from http

// Determine environment and history type
const isBrowser = typeof window !== "undefined";
const history = isBrowser ? createBrowserHistory() : createMemoryHistory();
const http = createClient(globalThis.fetch);

console.log(`Running in ${isBrowser ? "browser" : "Node.js"} environment`);

// --- Signals Example: Counter ---
const count = signal(0);
const doubleCount = computed(() => count.get() * 2);

effect(() => {
    console.log(`[Signal] Count: ${count.get()}, Double: ${doubleCount.get()}`);
});

// --- Query/HTTP Example: Fetch User ---
interface User {
    id: number;
    name: string;
    username: string;
    email: string;
}

// Mock API for Node.js environment if needed, or just use a real public API
const fetchUser = async (id: string): Promise<User> => {
    console.log(`[HTTP] Fetching user ${id}...`);
    // Using jsonplaceholder for demo purposes
    const res = await http.get(`https://jsonplaceholder.typicode.com/users/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch user: ${res.statusText}`);
    return res.json();
};

// We'll wrap the query creation in a function to create it when needed
const createUserQuery = (id: string) => createQuery<User>(() => fetchUser(id));

// Define routes
const routes = [
    {
        path: "/",
        handler: () => {
            // Increment signal on home visit just to show reactivity
            count.set(count.get() + 1);
            return "Home Page - Counter incremented!";
        },
    },
    {
        path: "/users/:id",
        handler: async ({ params }: { params: any }) => {
            const { id } = params;
            // Create a query for this user
            const { state, refetch } = createUserQuery(id);

            // Wait for data (in a real app, you might return the state signal and let the UI react)
            // For this CLI/SSR example, we'll poll/wait until loading is done

            return new Promise<string>((resolve) => {
                const dispose = effect(() => {
                    const s = state.get();
                    if (!s.isLoading) {
                        dispose(); // Stop watching
                        if (s.error) {
                            resolve(`User Profile Error: ${s.error.message}`);
                        } else if (s.data) {
                            resolve(`User Profile: ${s.data.name} (${s.data.email})`);
                        } else {
                            resolve("User Profile: No data");
                        }
                    }
                });
            });
        },
    },
];

// Initialize router
const router = createRouter(routes, { history });

// Example usage sequence
async function runExample() {
    const app = typeof document !== "undefined" ? document.getElementById("app") : null;
    const log = (message: string) => {
        console.log(message);
        if (app) {
            const p = document.createElement("p");
            p.textContent = message;
            app.appendChild(p);
        }
    };

    // 1. Initial resolution
    log(`Current URL: ${history.location.href}`);
    const initialResult = await router.resolve(history.location.href);
    log(`Initial Route Result: ${initialResult}`);

    if (!isBrowser) {
        // 2. Navigate to user profile
        log("Navigating to /users/1...");
        router.navigate("/users/1");
        log(`Current URL: ${history.location.href}`);

        const userResult = await router.resolve(history.location.href);
        log(`User Route Result: ${userResult}`);

        // 3. Navigate back home
        log("Navigating to /...");
        router.navigate("/");
        const homeResult = await router.resolve(history.location.href);
        log(`Home Route Result: ${homeResult}`);

        // Final signal state
        log(`Final Count: ${count.get()}`);

    } else {
        if (app) {
            // Simple UI for browser
            const countDisplay = document.createElement("div");
            effect(() => {
                countDisplay.textContent = `Count: ${count.get()}, Double: ${doubleCount.get()}`;
            });
            app.appendChild(countDisplay);

            const incButton = document.createElement("button");
            incButton.textContent = "Increment";
            incButton.onclick = () => count.set(count.get() + 1);
            app.appendChild(incButton);

            app.appendChild(document.createElement("hr"));

            const navButton = document.createElement("button");
            navButton.textContent = "Go to /users/1";
            navButton.onclick = async () => {
                router.navigate("/users/1");
                const res = await router.resolve(history.location.href);
                log(`Navigated to: ${res}`);
            };
            app.appendChild(navButton);

            const homeButton = document.createElement("button");
            homeButton.textContent = "Go Home";
            homeButton.onclick = async () => {
                router.navigate("/");
                const res = await router.resolve(history.location.href);
                log(`Navigated to: ${res}`);
            };
            app.appendChild(homeButton);
        }
    }
}

runExample().catch(console.error);
