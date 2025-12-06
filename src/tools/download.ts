import { z } from 'zod';
import { BrowserManager } from '../browser.js';
import * as fs from 'fs';
import * as path from 'path';

export const downloadTool = {
    name: 'browser_download',
    description: 'Download a file from a URL to local disk',
    schema: z.object({
        url: z.string().describe('URL of the file to download'),
        savePath: z.string().optional().describe('Local path to save the file (default: ./downloads/)'),
    }),
    execute: async ({ url, savePath }: { url: string; savePath?: string }) => {
        const page = await BrowserManager.getInstance().getPage();
        const context = page.context();

        // Set up download handling
        const downloadDir = savePath ? path.dirname(savePath) : './downloads';
        if (!fs.existsSync(downloadDir)) {
            fs.mkdirSync(downloadDir, { recursive: true });
        }

        // Trigger download via page navigation or fetch
        const response = await page.request.get(url);
        const buffer = await response.body();

        const fileName = savePath || path.join(downloadDir, path.basename(new URL(url).pathname) || 'download');
        fs.writeFileSync(fileName, buffer);

        return {
            content: [{
                type: 'text' as const,
                text: `Downloaded ${buffer.length} bytes to ${fileName}`,
            }],
        };
    },
};

export const downloadClickTool = {
    name: 'browser_download_click',
    description: 'Click a download link and save the downloaded file',
    schema: z.object({
        selector: z.string().describe('CSS selector of the download link/button'),
        savePath: z.string().optional().describe('Path to save file (default: auto-detect filename)'),
        timeout: z.number().optional().describe('Timeout in ms (default: 30000)'),
    }),
    execute: async ({ selector, savePath, timeout = 30000 }: { selector: string; savePath?: string; timeout?: number }) => {
        const page = await BrowserManager.getInstance().getPage();

        // Wait for download to start after clicking
        const [download] = await Promise.all([
            page.waitForEvent('download', { timeout }),
            page.click(selector),
        ]);

        const downloadPath = savePath || `./downloads/${download.suggestedFilename()}`;
        const dir = path.dirname(downloadPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        await download.saveAs(downloadPath);

        return {
            content: [{
                type: 'text' as const,
                text: `Downloaded file to ${downloadPath} (${download.suggestedFilename()})`,
            }],
        };
    },
};
