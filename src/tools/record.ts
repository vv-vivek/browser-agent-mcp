import { z } from 'zod';
import { BrowserManager } from '../browser.js';
import * as fs from 'fs';

export const recordStartTool = {
    name: 'browser_record_start',
    description: 'Start recording browser session as video',
    schema: z.object({
        outputDir: z.string().optional().describe('Directory to save recording (default: ./recordings)'),
    }),
    execute: async ({ outputDir = './recordings' }: { outputDir?: string }) => {
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        await BrowserManager.getInstance().startRecording(outputDir);

        return {
            content: [{
                type: 'text' as const,
                text: `Recording started. Videos will be saved to ${outputDir}. Call browser_record_stop to save.`,
            }],
        };
    },
};

export const recordStopTool = {
    name: 'browser_record_stop',
    description: 'Stop recording and save the video',
    schema: z.object({}),
    execute: async () => {
        const videoPath = await BrowserManager.getInstance().stopRecording();

        return {
            content: [{
                type: 'text' as const,
                text: videoPath
                    ? `Recording saved to ${videoPath}`
                    : 'Recording stopped. Note: Video is saved when the browser context closes.',
            }],
        };
    },
};
