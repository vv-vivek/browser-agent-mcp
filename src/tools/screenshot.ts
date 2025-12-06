import { z } from 'zod';
import { BrowserManager } from '../browser.js';

export const screenshotTool = {
    name: 'browser_screenshot',
    description: 'Takes a screenshot of the current page.',
    schema: z.object({
        name: z.string().optional().describe('Name for the screenshot'),
        fullPage: z.boolean().optional().default(false).describe('Whether to take a full page screenshot'),
    }),
    execute: async ({ name, fullPage }: { name?: string; fullPage?: boolean }) => {
        const page = await BrowserManager.getInstance().getPage();
        const buffer = await page.screenshot({ fullPage });
        const base64 = buffer.toString('base64');

        return {
            content: [
                {
                    type: 'image' as const,
                    data: base64,
                    mimeType: 'image/png',
                },
                {
                    type: 'text' as const,
                    text: `Screenshot taken${name ? `: ${name}` : ''}`,
                }
            ],
        };
    },
};
