import { type Fetch } from './middleware.ts';

export interface HttpClient {
    (input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
    get(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
    post(input: RequestInfo | URL, body?: any, init?: RequestInit): Promise<Response>;
    put(input: RequestInfo | URL, body?: any, init?: RequestInit): Promise<Response>;
    patch(input: RequestInfo | URL, body?: any, init?: RequestInit): Promise<Response>;
    delete(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
}

/**
 * Creates an HTTP client with convenience methods.
 * @param fetchFn - The fetch function to use (can be a composed fetch).
 * @returns An HttpClient object.
 */
export function createClient(fetchFn: Fetch = globalThis.fetch): HttpClient {
    const client = ((input, init) => fetchFn(input, init)) as HttpClient;

    client.get = (input, init) => fetchFn(input, { ...init, method: 'GET' });

    client.post = (input, body, init) =>
        fetchFn(input, { ...init, method: 'POST', body });

    client.put = (input, body, init) =>
        fetchFn(input, { ...init, method: 'PUT', body });

    client.patch = (input, body, init) =>
        fetchFn(input, { ...init, method: 'PATCH', body });

    client.delete = (input, init) =>
        fetchFn(input, { ...init, method: 'DELETE' });

    return client;
}
