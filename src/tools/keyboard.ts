import { z } from 'zod';
import { BrowserManager } from '../browser.js';

export const keyboardTool = {
    name: 'browser_keyboard',
    description: 'Send keyboard keys or shortcuts (Enter, Escape, Tab, Arrow keys, Ctrl+A, etc.)',
    schema: z.object({
        key: z.string().describe('Key to press: Enter, Escape, Tab, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Backspace, Delete, Home, End, PageUp, PageDown, F1-F12, or combinations like Control+A, Shift+Tab, Alt+F4'),
        selector: z.string().optional().describe('Optional: Focus on this element before pressing key'),
    }),
    execute: async ({ key, selector }: { key: string; selector?: string }) => {
        const page = await BrowserManager.getInstance().getPage();

        if (selector) {
            await page.focus(selector);
        }

        // Handle modifier combinations like Control+A, Shift+Tab
        await page.keyboard.press(key);

        return {
            content: [{
                type: 'text' as const,
                text: `Pressed key: ${key}${selector ? ` on element ${selector}` : ''}`,
            }],
        };
    },
};

export const keyboardTypeTool = {
    name: 'browser_keyboard_type',
    description: 'Type a string of text character by character (with realistic typing)',
    schema: z.object({
        text: z.string().describe('Text to type'),
        delay: z.number().optional().describe('Delay between keystrokes in ms (default: 50)'),
    }),
    execute: async ({ text, delay = 50 }: { text: string; delay?: number }) => {
        const page = await BrowserManager.getInstance().getPage();
        await page.keyboard.type(text, { delay });

        return {
            content: [{
                type: 'text' as const,
                text: `Typed ${text.length} characters`,
            }],
        };
    },
};
