import { z } from 'zod';
import { BrowserManager } from '../browser.js';

export const backTool = {
    name: 'browser_back',
    description: 'Navigates back in browser history.',
    schema: z.object({}),
    execute: async () => {
        const page = await BrowserManager.getInstance().getPage();
        await page.goBack();
        const url = page.url();

        return {
            content: [{
                type: 'text' as const,
                text: `Navigated back to: ${url}`,
            }],
        };
    },
};

export const forwardTool = {
    name: 'browser_forward',
    description: 'Navigates forward in browser history.',
    schema: z.object({}),
    execute: async () => {
        const page = await BrowserManager.getInstance().getPage();
        await page.goForward();
        const url = page.url();

        return {
            content: [{
                type: 'text' as const,
                text: `Navigated forward to: ${url}`,
            }],
        };
    },
};

export const getUrlTool = {
    name: 'browser_get_url',
    description: 'Gets the current page URL.',
    schema: z.object({}),
    execute: async () => {
        const page = await BrowserManager.getInstance().getPage();
        const url = page.url();

        return {
            content: [{
                type: 'text' as const,
                text: url,
            }],
        };
    },
};

export const getTitleTool = {
    name: 'browser_get_title',
    description: 'Gets the current page title.',
    schema: z.object({}),
    execute: async () => {
        const page = await BrowserManager.getInstance().getPage();
        const title = await page.title();

        return {
            content: [{
                type: 'text' as const,
                text: title,
            }],
        };
    },
};
