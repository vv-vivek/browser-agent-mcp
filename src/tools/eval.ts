import { z } from 'zod';
import { BrowserManager } from '../browser.js';

export const evalTool = {
    name: 'browser_eval',
    description: 'Executes JavaScript code in the browser context and returns the result.',
    schema: z.object({
        script: z.string().describe('JavaScript code to execute'),
    }),
    execute: async ({ script }: { script: string }) => {
        const page = await BrowserManager.getInstance().getPage();

        try {
            const result = await page.evaluate((code) => {
                // Execute the code and return the result
                return eval(code);
            }, script);

            return {
                content: [{
                    type: 'text' as const,
                    text: `Result: ${JSON.stringify(result, null, 2)}`,
                }],
            };
        } catch (error) {
            return {
                content: [{
                    type: 'text' as const,
                    text: `JavaScript error: ${error instanceof Error ? error.message : String(error)}`,
                }],
                isError: true,
            };
        }
    },
};
