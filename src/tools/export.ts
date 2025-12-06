import { z } from 'zod';
import { BrowserManager } from '../browser.js';

export const savePdfTool = {
    name: 'browser_save_pdf',
    description: 'Saves the current page as a PDF file.',
    schema: z.object({
        path: z.string().optional().describe('Absolute file path to save PDF (defaults to temp file)'),
        format: z.enum(['Letter', 'Legal', 'Tabloid', 'A4', 'A3']).optional().default('A4').describe('Paper format'),
        printBackground: z.boolean().optional().default(true).describe('Include background graphics'),
    }),
    execute: async ({ path, format, printBackground }: { path?: string; format?: string; printBackground?: boolean }) => {
        const page = await BrowserManager.getInstance().getPage();

        const pdfPath = path || `./page-${Date.now()}.pdf`;

        await page.pdf({
            path: pdfPath,
            format: (format || 'A4') as any,
            printBackground: printBackground !== false,
        });

        return {
            content: [{
                type: 'text' as const,
                text: `Saved PDF to: ${pdfPath}`,
            }],
        };
    },
};
