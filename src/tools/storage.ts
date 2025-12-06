import { z } from 'zod';
import { BrowserManager } from '../browser.js';

export const getStorageTool = {
    name: 'browser_get_storage',
    description: 'Gets all items from localStorage or sessionStorage.',
    schema: z.object({
        type: z.enum(['local', 'session']).default('local').describe('Storage type'),
        key: z.string().optional().describe('Specific key to get (omit for all)'),
    }),
    execute: async ({ type, key }: { type?: string; key?: string }) => {
        const page = await BrowserManager.getInstance().getPage();
        const storageType = type === 'session' ? 'sessionStorage' : 'localStorage';

        const result = await page.evaluate(({ storage, k }) => {
            const store = storage === 'sessionStorage' ? window.sessionStorage : window.localStorage;
            if (k) {
                return { [k]: store.getItem(k) };
            }
            const items: Record<string, string | null> = {};
            for (let i = 0; i < store.length; i++) {
                const key = store.key(i);
                if (key) items[key] = store.getItem(key);
            }
            return items;
        }, { storage: storageType, k: key });

        return {
            content: [{
                type: 'text' as const,
                text: JSON.stringify(result, null, 2),
            }],
        };
    },
};

export const setStorageTool = {
    name: 'browser_set_storage',
    description: 'Sets an item in localStorage or sessionStorage.',
    schema: z.object({
        type: z.enum(['local', 'session']).default('local').describe('Storage type'),
        key: z.string().describe('Storage key'),
        value: z.string().describe('Value to store'),
    }),
    execute: async ({ type, key, value }: { type?: string; key: string; value: string }) => {
        const page = await BrowserManager.getInstance().getPage();
        const storageType = type === 'session' ? 'sessionStorage' : 'localStorage';

        await page.evaluate(({ storage, k, v }) => {
            const store = storage === 'sessionStorage' ? window.sessionStorage : window.localStorage;
            store.setItem(k, v);
        }, { storage: storageType, k: key, v: value });

        return {
            content: [{
                type: 'text' as const,
                text: `Set ${storageType}["${key}"]`,
            }],
        };
    },
};

export const clearStorageTool = {
    name: 'browser_clear_storage',
    description: 'Clears all items from localStorage or sessionStorage.',
    schema: z.object({
        type: z.enum(['local', 'session']).default('local').describe('Storage type'),
    }),
    execute: async ({ type }: { type?: string }) => {
        const page = await BrowserManager.getInstance().getPage();
        const storageType = type === 'session' ? 'sessionStorage' : 'localStorage';

        await page.evaluate((storage) => {
            const store = storage === 'sessionStorage' ? window.sessionStorage : window.localStorage;
            store.clear();
        }, storageType);

        return {
            content: [{
                type: 'text' as const,
                text: `Cleared ${storageType}`,
            }],
        };
    },
};
