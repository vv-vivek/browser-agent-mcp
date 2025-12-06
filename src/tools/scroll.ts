import { z } from 'zod';
import { BrowserManager } from '../browser.js';

export const scrollTool = {
    name: 'browser_scroll',
    description: 'Scrolls the page in a specified direction or to a specific element.',
    schema: z.object({
        direction: z.enum(['up', 'down', 'top', 'bottom']).optional().describe('Direction to scroll'),
        amount: z.number().optional().default(500).describe('Amount to scroll in pixels'),
        selector: z.string().optional().describe('CSS selector of element to scroll into view'),
    }),
    execute: async ({ direction, amount, selector }: { direction?: string; amount?: number; selector?: string }) => {
        const page = await BrowserManager.getInstance().getPage();

        if (selector) {
            // Scroll element into view
            await page.locator(selector).scrollIntoViewIfNeeded();
            return {
                content: [{
                    type: 'text' as const,
                    text: `Scrolled element "${selector}" into view`,
                }],
            };
        }

        const scrollAmount = amount || 500;

        switch (direction) {
            case 'up':
                await page.evaluate((amt) => window.scrollBy(0, -amt), scrollAmount);
                break;
            case 'down':
                await page.evaluate((amt) => window.scrollBy(0, amt), scrollAmount);
                break;
            case 'top':
                await page.evaluate(() => window.scrollTo(0, 0));
                break;
            case 'bottom':
                await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
                break;
            default:
                await page.evaluate((amt) => window.scrollBy(0, amt), scrollAmount);
        }

        return {
            content: [{
                type: 'text' as const,
                text: `Scrolled ${direction || 'down'} by ${scrollAmount}px`,
            }],
        };
    },
};
