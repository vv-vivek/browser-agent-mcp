import { z } from 'zod';
import { BrowserManager } from '../browser.js';

export const selectTool = {
    name: 'browser_select',
    description: 'Selects an option from a dropdown/select element.',
    schema: z.object({
        selector: z.string().describe('CSS selector of the select element'),
        value: z.string().optional().describe('Value attribute of option to select'),
        label: z.string().optional().describe('Visible text of option to select'),
        index: z.number().optional().describe('Index of option to select (0-based)'),
    }),
    execute: async ({ selector, value, label, index }: { selector: string; value?: string; label?: string; index?: number }) => {
        const page = await BrowserManager.getInstance().getPage();
        const selectElement = page.locator(selector);

        let selectedValue: string[];

        if (value !== undefined) {
            selectedValue = await selectElement.selectOption({ value });
        } else if (label !== undefined) {
            selectedValue = await selectElement.selectOption({ label });
        } else if (index !== undefined) {
            selectedValue = await selectElement.selectOption({ index });
        } else {
            return {
                content: [{
                    type: 'text' as const,
                    text: 'Error: Must provide value, label, or index to select',
                }],
                isError: true,
            };
        }

        return {
            content: [{
                type: 'text' as const,
                text: `Selected option: ${selectedValue.join(', ')}`,
            }],
        };
    },
};
