import { z } from 'zod';
import { BrowserManager } from '../browser.js';

export const a11yCheckTool = {
    name: 'browser_a11y_check',
    description: 'Runs an accessibility audit on the current page using Playwright\'s accessibility snapshot.',
    schema: z.object({
        selector: z.string().optional().describe('CSS selector to audit (defaults to entire page)'),
    }),
    execute: async ({ selector }: { selector?: string }) => {
        const page = await BrowserManager.getInstance().getPage();

        // Get accessibility snapshot
        const snapshot = await page.accessibility.snapshot({
            root: selector ? await page.locator(selector).elementHandle() || undefined : undefined,
        });

        if (!snapshot) {
            return {
                content: [{
                    type: 'text' as const,
                    text: 'No accessibility tree available for this page/element',
                }],
            };
        }

        // Analyze the snapshot for issues
        const issues: string[] = [];
        const stats = {
            totalNodes: 0,
            nodesWithRoles: 0,
            nodesWithNames: 0,
            images: 0,
            imagesWithAlt: 0,
            buttons: 0,
            links: 0,
            inputs: 0,
            headings: 0,
        };

        const analyzeNode = (node: any, depth = 0) => {
            stats.totalNodes++;

            if (node.role) stats.nodesWithRoles++;
            if (node.name) stats.nodesWithNames++;

            switch (node.role) {
                case 'img':
                case 'image':
                    stats.images++;
                    if (node.name) stats.imagesWithAlt++;
                    else issues.push(`Image without alt text at depth ${depth}`);
                    break;
                case 'button':
                    stats.buttons++;
                    if (!node.name) issues.push(`Button without accessible name at depth ${depth}`);
                    break;
                case 'link':
                    stats.links++;
                    if (!node.name) issues.push(`Link without accessible name at depth ${depth}`);
                    break;
                case 'textbox':
                case 'searchbox':
                case 'combobox':
                    stats.inputs++;
                    if (!node.name) issues.push(`Input without label at depth ${depth}`);
                    break;
                case 'heading':
                    stats.headings++;
                    break;
            }

            if (node.children) {
                for (const child of node.children) {
                    analyzeNode(child, depth + 1);
                }
            }
        };

        analyzeNode(snapshot);

        const report = {
            summary: {
                passed: issues.length === 0,
                issueCount: issues.length,
                ...stats,
            },
            issues: issues.slice(0, 20), // Limit to 20 issues
            accessibilityTree: snapshot,
        };

        return {
            content: [{
                type: 'text' as const,
                text: JSON.stringify(report, null, 2),
            }],
        };
    },
};
