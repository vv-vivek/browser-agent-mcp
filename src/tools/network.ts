import { z } from 'zod';
import { BrowserManager } from '../browser.js';

// Store for captured requests
const capturedRequests: Array<{
    url: string;
    method: string;
    resourceType: string;
    timestamp: number;
    status?: number;
    response?: any;
}> = [];

let isCapturing = false;

export const startCaptureRequestsTool = {
    name: 'browser_capture_requests_start',
    description: 'Starts capturing network requests on the current page.',
    schema: z.object({
        urlPattern: z.string().optional().describe('URL pattern to filter (regex)'),
    }),
    execute: async ({ urlPattern }: { urlPattern?: string }) => {
        const page = await BrowserManager.getInstance().getPage();

        if (isCapturing) {
            return {
                content: [{
                    type: 'text' as const,
                    text: 'Already capturing requests. Call browser_capture_requests_stop first.',
                }],
            };
        }

        capturedRequests.length = 0;
        isCapturing = true;

        const pattern = urlPattern ? new RegExp(urlPattern) : null;

        page.on('request', (request) => {
            if (!pattern || pattern.test(request.url())) {
                capturedRequests.push({
                    url: request.url(),
                    method: request.method(),
                    resourceType: request.resourceType(),
                    timestamp: Date.now(),
                });
            }
        });

        page.on('response', (response) => {
            const req = capturedRequests.find(r => r.url === response.url());
            if (req) {
                req.status = response.status();
            }
        });

        return {
            content: [{
                type: 'text' as const,
                text: 'Started capturing network requests',
            }],
        };
    },
};

export const getRequestsTool = {
    name: 'browser_get_requests',
    description: 'Gets all captured network requests.',
    schema: z.object({
        filter: z.object({
            urlPattern: z.string().optional().describe('URL pattern to filter'),
            method: z.string().optional().describe('HTTP method to filter'),
            resourceType: z.string().optional().describe('Resource type to filter'),
        }).optional().describe('Filters for requests'),
    }),
    execute: async ({ filter }: { filter?: { urlPattern?: string; method?: string; resourceType?: string } }) => {
        let requests = [...capturedRequests];

        if (filter) {
            if (filter.urlPattern) {
                const pattern = new RegExp(filter.urlPattern);
                requests = requests.filter(r => pattern.test(r.url));
            }
            if (filter.method) {
                requests = requests.filter(r => r.method === filter.method);
            }
            if (filter.resourceType) {
                requests = requests.filter(r => r.resourceType === filter.resourceType);
            }
        }

        return {
            content: [{
                type: 'text' as const,
                text: JSON.stringify(requests, null, 2),
            }],
        };
    },
};

export const clearRequestsTool = {
    name: 'browser_clear_requests',
    description: 'Clears all captured network requests.',
    schema: z.object({}),
    execute: async () => {
        const count = capturedRequests.length;
        capturedRequests.length = 0;
        isCapturing = false;

        return {
            content: [{
                type: 'text' as const,
                text: `Cleared ${count} captured requests`,
            }],
        };
    },
};
