import { z } from 'zod';
import { BrowserManager } from '../browser.js';

export const checkTool = {
    name: 'browser_check',
    description: 'Checks or unchecks a checkbox or radio button.',
    schema: z.object({
        selector: z.string().describe('CSS selector of the checkbox or radio button'),
        checked: z.boolean().optional().default(true).describe('Whether to check (true) or uncheck (false)'),
    }),
    execute: async ({ selector, checked }: { selector: string; checked?: boolean }) => {
        const page = await BrowserManager.getInstance().getPage();
        const element = page.locator(selector);

        if (checked !== false) {
            await element.check();
        } else {
            await element.uncheck();
        }

        return {
            content: [{
                type: 'text' as const,
                text: `${checked !== false ? 'Checked' : 'Unchecked'} element: ${selector}`,
            }],
        };
    },
};
