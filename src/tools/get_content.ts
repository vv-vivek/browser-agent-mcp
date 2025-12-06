import { z } from 'zod';
import { BrowserManager } from '../browser.js';

export const getContentTool = {
    name: 'browser_get_content',
    description: 'Returns the text content of the page or a specific element.',
    schema: z.object({
        selector: z.string().optional().describe('CSS selector of the element to get content from. If omitted, returns full page text.'),
    }),
    execute: async ({ selector }: { selector?: string }) => {
        const page = await BrowserManager.getInstance().getPage();
        let content = '';

        if (selector) {
            content = await page.textContent(selector) || '';
        } else {
            content = await page.evaluate(() => document.body.innerText);
        }

        return {
            content: [
                {
                    type: 'text' as const,
                    text: content,
                },
            ],
        };
    },
};
