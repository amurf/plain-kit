import { test, describe } from 'node:test';
import assert from 'node:assert';
import { compose, withBaseUrl, withJsonBody, withAuth, createClient } from '../src/index.ts';

describe('Middleware', () => {
    test('compose should execute middleware in correct order', async () => {
        const order: string[] = [];
        const mw1 = (next: any) => async (input: any, init: any) => {
            order.push('mw1 start');
            const res = await next(input, init);
            order.push('mw1 end');
            return res;
        };
        const mw2 = (next: any) => async (input: any, init: any) => {
            order.push('mw2 start');
            const res = await next(input, init);
            order.push('mw2 end');
            return res;
        };

        const mockFetch = async () => {
            order.push('fetch');
            return new Response('ok');
        };

        const composed = compose(mw1, mw2);
        await composed(mockFetch)('http://example.com');

        assert.deepStrictEqual(order, [
            'mw1 start',
            'mw2 start',
            'fetch',
            'mw2 end',
            'mw1 end',
        ]);
    });

    test('withBaseUrl should prepend base URL', async () => {
        let capturedUrl;
        const mockFetch = async (url: any) => {
            capturedUrl = url.toString();
            return new Response('ok');
        };

        const client = compose(withBaseUrl('https://api.example.com'))(mockFetch);

        await client('/users');
        assert.strictEqual(capturedUrl, 'https://api.example.com/users');

        await client('posts');
        assert.strictEqual(capturedUrl, 'https://api.example.com/posts');
    });

    test('withJsonBody should stringify body and set Content-Type', async () => {
        let capturedInit: any;
        const mockFetch = async (url: any, init: any) => {
            capturedInit = init;
            return new Response('ok');
        };

        const client = compose(withJsonBody())(mockFetch);

        await client('http://example.com', {
            method: 'POST',
            body: { foo: 'bar' } as any,
        });

        assert.strictEqual(capturedInit.headers.get('Content-Type'), 'application/json');
        assert.strictEqual(capturedInit.body, '{"foo":"bar"}');
    });

    test('withAuth should add Authorization header', async () => {
        let capturedInit: any;
        const mockFetch = async (url: any, init: any) => {
            capturedInit = init;
            return new Response('ok');
        };

        const client = compose(withAuth('secret-token'))(mockFetch);

        await client('http://example.com');

        assert.strictEqual(capturedInit.headers.get('Authorization'), 'Bearer secret-token');
    });
});

describe('createClient', () => {
    test('should provide convenience methods', async () => {
        let capturedMethod;
        let capturedBody;
        const mockFetch = async (url: any, init: any) => {
            capturedMethod = init?.method;
            capturedBody = init?.body;
            return new Response('ok');
        };

        const client = createClient(mockFetch);

        await client.get('http://example.com');
        assert.strictEqual(capturedMethod, 'GET');

        await client.post('http://example.com', { data: 123 });
        assert.strictEqual(capturedMethod, 'POST');
        assert.deepStrictEqual(capturedBody, { data: 123 });
    });

    test('should work with composed fetch', async () => {
        let capturedUrl;
        const mockFetch = async (url: any) => {
            capturedUrl = url.toString();
            return new Response('ok');
        };

        const composed = compose(withBaseUrl('https://api.example.com'))(mockFetch);
        const client = createClient(composed);

        await client.get('/users');
        assert.strictEqual(capturedUrl, 'https://api.example.com/users');
    });
});
