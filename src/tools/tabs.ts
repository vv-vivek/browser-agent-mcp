import { z } from 'zod';
import { BrowserManager } from '../browser.js';

export const newTabTool = {
    name: 'browser_new_tab',
    description: 'Opens a new browser tab, optionally navigating to a URL.',
    schema: z.object({
        url: z.string().url().optional().describe('URL to navigate to in the new tab'),
    }),
    execute: async ({ url }: { url?: string }) => {
        const manager = BrowserManager.getInstance();
        const tabId = await manager.newTab(url);

        return {
            content: [{
                type: 'text' as const,
                text: `Opened new tab: ${tabId}${url ? ` navigated to ${url}` : ''}`,
            }],
        };
    },
};

export const switchTabTool = {
    name: 'browser_switch_tab',
    description: 'Switches to a different browser tab.',
    schema: z.object({
        tabId: z.string().describe('ID of the tab to switch to'),
    }),
    execute: async ({ tabId }: { tabId: string }) => {
        const manager = BrowserManager.getInstance();
        const success = await manager.switchTab(tabId);

        if (!success) {
            return {
                content: [{
                    type: 'text' as const,
                    text: `Tab not found: ${tabId}`,
                }],
                isError: true,
            };
        }

        return {
            content: [{
                type: 'text' as const,
                text: `Switched to tab: ${tabId}`,
            }],
        };
    },
};

export const closeTabTool = {
    name: 'browser_close_tab',
    description: 'Closes a browser tab.',
    schema: z.object({
        tabId: z.string().optional().describe('ID of the tab to close (defaults to active tab)'),
    }),
    execute: async ({ tabId }: { tabId?: string }) => {
        const manager = BrowserManager.getInstance();
        const success = await manager.closeTab(tabId);

        if (!success) {
            return {
                content: [{
                    type: 'text' as const,
                    text: `Failed to close tab: ${tabId || 'active'}`,
                }],
                isError: true,
            };
        }

        return {
            content: [{
                type: 'text' as const,
                text: `Closed tab: ${tabId || 'active'}. Now on: ${manager.getActiveTabId()}`,
            }],
        };
    },
};

export const listTabsTool = {
    name: 'browser_list_tabs',
    description: 'Lists all open browser tabs.',
    schema: z.object({}),
    execute: async () => {
        const manager = BrowserManager.getInstance();
        const tabs = await manager.getTabsWithTitles();

        return {
            content: [{
                type: 'text' as const,
                text: JSON.stringify(tabs, null, 2),
            }],
        };
    },
};
