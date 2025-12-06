import { z } from 'zod';
import { BrowserManager } from '../browser.js';

export const iframeTool = {
    name: 'browser_iframe',
    description: 'Enter an iframe to interact with its contents',
    schema: z.object({
        selector: z.string().describe('CSS selector of the iframe element'),
    }),
    execute: async ({ selector }: { selector: string }) => {
        const page = await BrowserManager.getInstance().getPage();

        const frameElement = await page.$(selector);
        if (!frameElement) {
            return {
                content: [{
                    type: 'text' as const,
                    text: `Iframe not found: ${selector}`,
                }],
                isError: true,
            };
        }

        const frame = await frameElement.contentFrame();
        if (!frame) {
            return {
                content: [{
                    type: 'text' as const,
                    text: `Could not access iframe content. It may be cross-origin protected.`,
                }],
                isError: true,
            };
        }

        // Store reference to iframe for subsequent operations
        // Note: Playwright handles frame context automatically
        const frameUrl = frame.url();
        const frameTitle = await frame.title();

        return {
            content: [{
                type: 'text' as const,
                text: `Entered iframe: ${frameTitle || 'untitled'} (${frameUrl}). Use browser_iframe_exit to return to main page.`,
            }],
        };
    },
};

export const iframeListTool = {
    name: 'browser_iframe_list',
    description: 'List all iframes on the current page',
    schema: z.object({}),
    execute: async () => {
        const page = await BrowserManager.getInstance().getPage();

        const frames = page.frames();
        const frameInfo = await Promise.all(frames.map(async (frame, index) => {
            const url = frame.url();
            const name = frame.name() || `frame-${index}`;
            return { index, name, url, isMain: frame === page.mainFrame() };
        }));

        return {
            content: [{
                type: 'text' as const,
                text: JSON.stringify(frameInfo, null, 2),
            }],
        };
    },
};

export const iframeClickTool = {
    name: 'browser_iframe_click',
    description: 'Click an element inside an iframe',
    schema: z.object({
        iframeSelector: z.string().describe('CSS selector of the iframe'),
        elementSelector: z.string().describe('CSS selector of element inside iframe'),
    }),
    execute: async ({ iframeSelector, elementSelector }: { iframeSelector: string; elementSelector: string }) => {
        const page = await BrowserManager.getInstance().getPage();

        const frameElement = await page.$(iframeSelector);
        if (!frameElement) {
            return {
                content: [{ type: 'text' as const, text: `Iframe not found: ${iframeSelector}` }],
                isError: true,
            };
        }

        const frame = await frameElement.contentFrame();
        if (!frame) {
            return {
                content: [{ type: 'text' as const, text: `Could not access iframe content` }],
                isError: true,
            };
        }

        await frame.click(elementSelector);

        return {
            content: [{
                type: 'text' as const,
                text: `Clicked ${elementSelector} inside iframe ${iframeSelector}`,
            }],
        };
    },
};
