import { z } from 'zod';
import { BrowserManager } from '../browser.js';

export const waitTool = {
    name: 'browser_wait',
    description: 'Waits for an element to appear on the page.',
    schema: z.object({
        selector: z.string().describe('CSS selector of element to wait for'),
        timeout: z.number().optional().default(30000).describe('Maximum time to wait in milliseconds'),
        state: z.enum(['visible', 'hidden', 'attached', 'detached']).optional().default('visible').describe('State to wait for'),
    }),
    execute: async ({ selector, timeout, state }: { selector: string; timeout?: number; state?: string }) => {
        const page = await BrowserManager.getInstance().getPage();
        const waitTimeout = timeout || 30000;
        const waitState = (state || 'visible') as 'visible' | 'hidden' | 'attached' | 'detached';

        try {
            await page.locator(selector).waitFor({
                timeout: waitTimeout,
                state: waitState,
            });

            return {
                content: [{
                    type: 'text' as const,
                    text: `Element "${selector}" is now ${waitState}`,
                }],
            };
        } catch (error) {
            return {
                content: [{
                    type: 'text' as const,
                    text: `Timeout: Element "${selector}" did not become ${waitState} within ${waitTimeout}ms`,
                }],
                isError: true,
            };
        }
    },
};
