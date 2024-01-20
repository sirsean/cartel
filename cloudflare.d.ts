import type { CloudflareResponseBody } from 'vite-plugin-cloudflare-functions/worker';

import 'vite-plugin-cloudflare-functions/client';

declare module 'vite-plugin-cloudflare-functions/client' {
  interface PagesResponseBody {
    '/api/**': {
      ALL: CloudflareResponseBody<typeof import('functions/api/_middleware')['onRequest']>;
      OPTIONS: CloudflareResponseBody<typeof import('functions/api/_middleware')['onRequestOptions']>;
    };
    '/api/ping': {
      GET: CloudflareResponseBody<typeof import('functions/api/ping')['onRequestGet']>;
    };
    '/api/reveal': {
      POST: CloudflareResponseBody<typeof import('functions/api/reveal')['onRequestPost']>;
    };
    '/images/:id.png': {
      GET: CloudflareResponseBody<typeof import('functions/images/[id].png')['onRequestGet']>;
    };
    '/metadata/:id.json': {
      GET: CloudflareResponseBody<typeof import('functions/metadata/[id].json')['onRequestGet']>;
    };
  }
}
