import { z } from 'zod';
import { BrowserManager } from '../browser.js';

export const typeTool = {
    name: 'browser_type',
    description: 'Types text into an input field.',
    schema: z.object({
        selector: z.string().describe('CSS selector of the input field'),
        text: z.string().describe('The text to type'),
    }),
    execute: async ({ selector, text }: { selector: string; text: string }) => {
        const page = await BrowserManager.getInstance().getPage();
        await page.fill(selector, text);
        return {
            content: [
                {
                    type: 'text' as const,
                    text: `Typed "${text}" into ${selector}`,
                },
            ],
        };
    },
};
