import { z } from 'zod';
import { BrowserManager } from '../browser.js';

export const getLinksTool = {
    name: 'browser_get_links',
    description: 'Extracts all links (URLs) from the current page or a specific container.',
    schema: z.object({
        selector: z.string().optional().describe('CSS selector to limit link extraction to a container'),
        includeText: z.boolean().optional().default(true).describe('Whether to include link text'),
    }),
    execute: async ({ selector, includeText }: { selector?: string; includeText?: boolean }) => {
        const page = await BrowserManager.getInstance().getPage();

        const links = await page.evaluate(({ sel, withText }) => {
            const container = sel ? document.querySelector(sel) : document;
            if (!container) return [];

            const anchors = container.querySelectorAll('a[href]');
            return Array.from(anchors).map((a) => {
                const anchor = a as HTMLAnchorElement;
                return withText
                    ? { url: anchor.href, text: anchor.textContent?.trim() || '' }
                    : { url: anchor.href };
            });
        }, { sel: selector, withText: includeText !== false });

        return {
            content: [{
                type: 'text' as const,
                text: JSON.stringify(links, null, 2),
            }],
        };
    },
};

export const getHtmlTool = {
    name: 'browser_get_html',
    description: 'Gets the HTML content of the page or a specific element.',
    schema: z.object({
        selector: z.string().optional().describe('CSS selector of element (defaults to entire page)'),
        outer: z.boolean().optional().default(true).describe('Whether to include outer HTML (true) or inner HTML (false)'),
    }),
    execute: async ({ selector, outer }: { selector?: string; outer?: boolean }) => {
        const page = await BrowserManager.getInstance().getPage();

        let html: string;

        if (selector) {
            const element = page.locator(selector);
            html = outer !== false
                ? await element.evaluate(el => el.outerHTML)
                : await element.innerHTML();
        } else {
            html = await page.content();
        }

        // Truncate if too long
        const maxLength = 50000;
        const truncated = html.length > maxLength;
        const content = truncated ? html.substring(0, maxLength) + '\n... [TRUNCATED]' : html;

        return {
            content: [{
                type: 'text' as const,
                text: content,
            }],
        };
    },
};
