import { z } from 'zod';
import { BrowserManager } from '../browser.js';

export const getCookiesTool = {
    name: 'browser_get_cookies',
    description: 'Gets all cookies for the current page or a specific URL.',
    schema: z.object({
        urls: z.array(z.string()).optional().describe('Specific URLs to get cookies for'),
    }),
    execute: async ({ urls }: { urls?: string[] }) => {
        const page = await BrowserManager.getInstance().getPage();
        const context = page.context();

        const cookies = await context.cookies(urls);

        return {
            content: [{
                type: 'text' as const,
                text: JSON.stringify(cookies, null, 2),
            }],
        };
    },
};

export const setCookiesTool = {
    name: 'browser_set_cookies',
    description: 'Sets cookies for the browser context.',
    schema: z.object({
        cookies: z.array(z.object({
            name: z.string().describe('Cookie name'),
            value: z.string().describe('Cookie value'),
            url: z.string().optional().describe('URL to associate cookie with'),
            domain: z.string().optional().describe('Cookie domain'),
            path: z.string().optional().describe('Cookie path'),
            expires: z.number().optional().describe('Unix timestamp for expiration'),
            httpOnly: z.boolean().optional().describe('HTTP only flag'),
            secure: z.boolean().optional().describe('Secure flag'),
            sameSite: z.enum(['Strict', 'Lax', 'None']).optional().describe('SameSite attribute'),
        })).describe('Array of cookies to set'),
    }),
    execute: async ({ cookies }: { cookies: any[] }) => {
        const page = await BrowserManager.getInstance().getPage();
        const context = page.context();

        await context.addCookies(cookies);

        return {
            content: [{
                type: 'text' as const,
                text: `Set ${cookies.length} cookie(s)`,
            }],
        };
    },
};

export const clearCookiesTool = {
    name: 'browser_clear_cookies',
    description: 'Clears all cookies from the browser context.',
    schema: z.object({}),
    execute: async () => {
        const page = await BrowserManager.getInstance().getPage();
        const context = page.context();

        await context.clearCookies();

        return {
            content: [{
                type: 'text' as const,
                text: 'Cleared all cookies',
            }],
        };
    },
};
