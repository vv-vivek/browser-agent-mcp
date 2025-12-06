import { z } from 'zod';
import { BrowserManager } from '../browser.js';

export const uploadTool = {
    name: 'browser_upload',
    description: 'Uploads a file to a file input element.',
    schema: z.object({
        selector: z.string().describe('CSS selector of the file input element'),
        filePath: z.string().describe('Absolute path to the file to upload'),
    }),
    execute: async ({ selector, filePath }: { selector: string; filePath: string }) => {
        const page = await BrowserManager.getInstance().getPage();

        try {
            await page.locator(selector).setInputFiles(filePath);

            return {
                content: [{
                    type: 'text' as const,
                    text: `Uploaded file: ${filePath} to ${selector}`,
                }],
            };
        } catch (error) {
            return {
                content: [{
                    type: 'text' as const,
                    text: `Error uploading file: ${error instanceof Error ? error.message : String(error)}`,
                }],
                isError: true,
            };
        }
    },
};
