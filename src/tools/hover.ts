import { z } from 'zod';
import { BrowserManager } from '../browser.js';

export const hoverTool = {
    name: 'browser_hover',
    description: 'Hovers over an element to trigger hover states, tooltips, or dropdown menus.',
    schema: z.object({
        selector: z.string().describe('CSS selector of element to hover over'),
    }),
    execute: async ({ selector }: { selector: string }) => {
        const page = await BrowserManager.getInstance().getPage();
        await page.locator(selector).hover();

        return {
            content: [{
                type: 'text' as const,
                text: `Hovered over element: ${selector}`,
            }],
        };
    },
};
