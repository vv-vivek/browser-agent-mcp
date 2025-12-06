import { z } from 'zod';
import { BrowserManager } from '../browser.js';
import { devices } from 'playwright';

// Common device presets
const devicePresets: Record<string, string> = {
    'iphone': 'iPhone 14',
    'iphone14': 'iPhone 14',
    'iphone13': 'iPhone 13',
    'iphone12': 'iPhone 12',
    'iphonese': 'iPhone SE',
    'android': 'Pixel 7',
    'pixel': 'Pixel 7',
    'pixel7': 'Pixel 7',
    'pixel5': 'Pixel 5',
    'samsung': 'Galaxy S9+',
    'galaxys9': 'Galaxy S9+',
    'ipad': 'iPad Pro 11',
    'ipadpro': 'iPad Pro 11',
    'ipadmini': 'iPad Mini',
};

export const mobileTool = {
    name: 'browser_mobile',
    description: 'Emulate a mobile device (changes viewport, user agent, touch support)',
    schema: z.object({
        device: z.string().describe('Device name: iphone, iphone14, android, pixel, samsung, ipad, ipadpro, or exact Playwright device name'),
    }),
    execute: async ({ device }: { device: string }) => {
        const manager = BrowserManager.getInstance();

        // Map common names to Playwright device names
        const deviceName = devicePresets[device.toLowerCase()] || device;
        const deviceConfig = devices[deviceName];

        if (!deviceConfig) {
            const availableDevices = Object.keys(devices).slice(0, 20).join(', ');
            return {
                content: [{
                    type: 'text' as const,
                    text: `Unknown device: ${device}. Available: ${availableDevices}... Use shortcuts: iphone, android, pixel, samsung, ipad`,
                }],
                isError: true,
            };
        }

        // Create a new context with device emulation
        const browser = await manager.getBrowser();
        const context = await browser.newContext({
            ...deviceConfig,
        });
        const page = await context.newPage();

        // Update the manager to use this page
        // Note: This replaces the current page
        const currentUrl = (await manager.getPage()).url();
        if (currentUrl && currentUrl !== 'about:blank') {
            await page.goto(currentUrl);
        }

        return {
            content: [{
                type: 'text' as const,
                text: `Emulating ${deviceName}: ${deviceConfig.viewport.width}x${deviceConfig.viewport.height}, ${deviceConfig.isMobile ? 'mobile' : 'desktop'}, touch: ${deviceConfig.hasTouch}`,
            }],
        };
    },
};

export const viewportTool = {
    name: 'browser_viewport',
    description: 'Set custom viewport size',
    schema: z.object({
        width: z.number().describe('Viewport width in pixels'),
        height: z.number().describe('Viewport height in pixels'),
        deviceScaleFactor: z.number().optional().describe('Device scale factor (default: 1)'),
        isMobile: z.boolean().optional().describe('Whether to emulate mobile (default: false)'),
    }),
    execute: async ({ width, height, deviceScaleFactor = 1, isMobile = false }: { width: number; height: number; deviceScaleFactor?: number; isMobile?: boolean }) => {
        const page = await BrowserManager.getInstance().getPage();

        await page.setViewportSize({ width, height });

        return {
            content: [{
                type: 'text' as const,
                text: `Viewport set to ${width}x${height}`,
            }],
        };
    },
};
