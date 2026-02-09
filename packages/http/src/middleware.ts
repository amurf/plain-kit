export type Fetch = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
export type Middleware = (next: Fetch) => Fetch;

/**
 * Composes multiple middleware functions into a single middleware.
 * @param middleware - The middleware functions to compose.
 * @returns A composed middleware function.
 */
export function compose(...middleware: Middleware[]): Middleware {
    return (next: Fetch) => middleware.reduceRight((acc, mw) => mw(acc), next);
}

/**
 * Middleware that prepends a base URL to the request URL.
 * @param baseUrl - The base URL to prepend.
 * @returns A middleware function.
 */
export function withBaseUrl(baseUrl: string): Middleware {
    return (next: Fetch) => (input, init) => {
        let url: string | URL;
        if (typeof input === 'string') {
            url = input.startsWith('/') ? new URL(originalUrl(input), baseUrl) : new URL(input, baseUrl);
        } else if (input instanceof URL) {
            url = new URL(input.toString(), baseUrl);
        } else {
            // Request object
            url = new URL(input.url, baseUrl);
        }

        // If input is a Request object, we need to clone it with the new URL
        if (input instanceof Request) {
            return next(new Request(url, input), init);
        }

        return next(url, init);
    };
}

// Helper to handle leading slash in creating URL with base
function originalUrl(input: string): string {
    return input.startsWith('/') ? input.slice(1) : input;
}


/**
 * Middleware that sets the Content-Type header to application/json and stringifies the body if it's an object.
 * @returns A middleware function.
 */
export function withJsonBody(): Middleware {
    return (next: Fetch) => (input, init) => {
        if (init && init.body && typeof init.body === 'object' && !(init.body instanceof Blob) && !(init.body instanceof FormData) && !(init.body instanceof URLSearchParams) && !(init.body instanceof ReadableStream)) {
            const headers = new Headers(init.headers);
            if (!headers.has('Content-Type')) {
                headers.set('Content-Type', 'application/json');
            }

            return next(input, {
                ...init,
                headers,
                body: JSON.stringify(init.body),
            });
        }
        return next(input, init);
    };
}

/**
 * Middleware to add an Authorization header.
 * @param token - The token or a function that returns the token.
 * @param scheme - The authorization scheme (default: 'Bearer').
 * @returns A middleware function.
 */
export function withAuth(token: string | (() => string | Promise<string>), scheme = 'Bearer'): Middleware {
    return (next: Fetch) => async (input, init) => {
        const tokenValue = typeof token === 'function' ? await token() : token;
        const headers = new Headers(init?.headers);
        headers.set('Authorization', `${scheme} ${tokenValue}`);

        return next(input, { ...init, headers });
    };
}
