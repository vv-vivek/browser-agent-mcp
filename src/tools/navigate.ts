import { z } from 'zod';
import { BrowserManager } from '../browser.js';

export const navigateTool = {
    name: 'browser_navigate',
    description: 'Navigates the browser to a specific URL.',
    schema: z.object({
        url: z.string().url().describe('The URL to navigate to'),
    }),
    execute: async ({ url }: { url: string }) => {
        const page = await BrowserManager.getInstance().getPage();
        await page.goto(url);
        return {
            content: [
                {
                    type: 'text' as const,
                    text: `Navigated to ${url}`,
                },
            ],
        };
    },
};
