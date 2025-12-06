import { z } from 'zod';
import { BrowserManager } from '../browser.js';

// Store for captured console messages
const capturedLogs: Array<{
    type: string;
    text: string;
    timestamp: number;
    location?: string;
}> = [];

let isListening = false;

export const startConsoleTool = {
    name: 'browser_console_start',
    description: 'Starts capturing console messages from the page.',
    schema: z.object({}),
    execute: async () => {
        const page = await BrowserManager.getInstance().getPage();

        if (isListening) {
            return {
                content: [{
                    type: 'text' as const,
                    text: 'Already listening to console',
                }],
            };
        }

        capturedLogs.length = 0;
        isListening = true;

        page.on('console', (msg) => {
            capturedLogs.push({
                type: msg.type(),
                text: msg.text(),
                timestamp: Date.now(),
                location: msg.location()?.url,
            });
        });

        return {
            content: [{
                type: 'text' as const,
                text: 'Started capturing console messages',
            }],
        };
    },
};

export const getConsoleTool = {
    name: 'browser_get_console',
    description: 'Gets all captured console messages.',
    schema: z.object({
        level: z.enum(['log', 'error', 'warning', 'info', 'debug', 'all']).optional().default('all').describe('Console level to filter'),
    }),
    execute: async ({ level }: { level?: string }) => {
        let logs = [...capturedLogs];

        if (level && level !== 'all') {
            logs = logs.filter(l => l.type === level);
        }

        return {
            content: [{
                type: 'text' as const,
                text: logs.length > 0
                    ? JSON.stringify(logs, null, 2)
                    : 'No console messages captured. Call browser_console_start first, then navigate/interact.',
            }],
        };
    },
};

export const clearConsoleTool = {
    name: 'browser_clear_console',
    description: 'Clears all captured console messages.',
    schema: z.object({}),
    execute: async () => {
        const count = capturedLogs.length;
        capturedLogs.length = 0;

        return {
            content: [{
                type: 'text' as const,
                text: `Cleared ${count} console messages`,
            }],
        };
    },
};
