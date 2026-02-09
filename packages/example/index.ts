import { createRouter, createMemoryHistory, createBrowserHistory } from "@plain-kit/router";

// Determine environment and history type
const isBrowser = typeof window !== "undefined";
const history = isBrowser ? createBrowserHistory() : createMemoryHistory();

console.log(`Running in ${isBrowser ? "browser" : "Node.js"} environment`);

// Define routes
const routes = [
    {
        path: "/",
        handler: () => "Home Page",
    },
    {
        path: "/users/:id",
        handler: ({ params }: { params: any }) => `User Profile: ${params.id}`,
    },
];

// Initialize router
const router = createRouter(routes, { history });

// Example usage sequence
async function runExample() {
    const app = document.getElementById("app");
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
        log("Navigating to /users/123...");
        router.navigate("/users/123");
        log(`Current URL: ${history.location.href}`);

        const userResult = await router.resolve(history.location.href);
        log(`User Route Result: ${userResult}`);

        // 3. Navigate back home
        log("Navigating to /...");
        router.navigate("/");
        const homeResult = await router.resolve(history.location.href);
        log(`Home Route Result: ${homeResult}`);
    } else {
        // In browser, we might want to let the user click links, but for now let's just show the initial result
        // and maybe add some buttons for navigation
        if (app) {
            const navButton = document.createElement("button");
            navButton.textContent = "Go to /users/123";
            navButton.onclick = async () => {
                router.navigate("/users/123");
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
