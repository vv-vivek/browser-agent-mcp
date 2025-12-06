import { z } from 'zod';
import { BrowserManager } from '../browser.js';

export const clickTool = {
    name: 'browser_click',
    description: 'Clicks an element on the page identified by a CSS selector.',
    schema: z.object({
        selector: z.string().describe('CSS selector of the element to click'),
    }),
    execute: async ({ selector }: { selector: string }) => {
        const page = await BrowserManager.getInstance().getPage();
        await page.click(selector);
        return {
            content: [
                {
                    type: 'text' as const,
                    text: `Clicked element: ${selector}`,
                },
            ],
        };
    },
};
