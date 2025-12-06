import { z } from 'zod';
import { BrowserManager } from '../browser.js';

export const dragTool = {
    name: 'browser_drag',
    description: 'Drag an element from one location to another',
    schema: z.object({
        sourceSelector: z.string().describe('CSS selector of element to drag'),
        targetSelector: z.string().describe('CSS selector of drop target'),
    }),
    execute: async ({ sourceSelector, targetSelector }: { sourceSelector: string; targetSelector: string }) => {
        const page = await BrowserManager.getInstance().getPage();

        await page.dragAndDrop(sourceSelector, targetSelector);

        return {
            content: [{
                type: 'text' as const,
                text: `Dragged ${sourceSelector} to ${targetSelector}`,
            }],
        };
    },
};

export const dragByOffsetTool = {
    name: 'browser_drag_offset',
    description: 'Drag an element by a pixel offset',
    schema: z.object({
        selector: z.string().describe('CSS selector of element to drag'),
        offsetX: z.number().describe('Horizontal offset in pixels'),
        offsetY: z.number().describe('Vertical offset in pixels'),
    }),
    execute: async ({ selector, offsetX, offsetY }: { selector: string; offsetX: number; offsetY: number }) => {
        const page = await BrowserManager.getInstance().getPage();

        const element = await page.$(selector);
        if (!element) {
            return {
                content: [{ type: 'text' as const, text: `Element not found: ${selector}` }],
                isError: true,
            };
        }

        const box = await element.boundingBox();
        if (!box) {
            return {
                content: [{ type: 'text' as const, text: `Could not get element position` }],
                isError: true,
            };
        }

        const startX = box.x + box.width / 2;
        const startY = box.y + box.height / 2;

        await page.mouse.move(startX, startY);
        await page.mouse.down();
        await page.mouse.move(startX + offsetX, startY + offsetY, { steps: 10 });
        await page.mouse.up();

        return {
            content: [{
                type: 'text' as const,
                text: `Dragged ${selector} by (${offsetX}, ${offsetY}) pixels`,
            }],
        };
    },
};
