import { z } from 'zod';
import { BrowserManager } from '../browser.js';
import { getLLMProvider } from '../llm.js';

export const summarizeTool = {
    name: 'browser_summarize',
    description: 'Generates an AI summary of the current page content.',
    schema: z.object({
        maxLength: z.number().optional().default(500).describe('Maximum length of summary'),
        focus: z.string().optional().describe('Specific aspect to focus on (e.g., "pricing", "features")'),
    }),
    execute: async ({ maxLength, focus }: { maxLength?: number; focus?: string }) => {
        const page = await BrowserManager.getInstance().getPage();

        // Extract main content
        const content = await page.evaluate(() => {
            // Remove scripts, styles, and navigation
            const clone = document.body.cloneNode(true) as HTMLElement;
            clone.querySelectorAll('script, style, nav, header, footer, aside').forEach(el => el.remove());
            return clone.textContent?.replace(/\s+/g, ' ').trim().substring(0, 10000) || '';
        });

        const title = await page.title();
        const url = page.url();

        const llm = getLLMProvider();

        try {
            const focusPrompt = focus ? `Focus specifically on: ${focus}` : '';
            const prompt = `Summarize the following webpage content in ${maxLength || 500} characters or less.
            
Title: ${title}
URL: ${url}
${focusPrompt}

Content:
${content.substring(0, 8000)}

Provide a clear, concise summary:`;

            const summary = await llm.generateText(prompt);

            return {
                content: [{
                    type: 'text' as const,
                    text: summary,
                }],
            };
        } catch (error) {
            // Fallback to basic extraction
            return {
                content: [{
                    type: 'text' as const,
                    text: `**${title}**\n\n${content.substring(0, maxLength || 500)}...`,
                }],
            };
        }
    },
};

export const analyzeScreenshotTool = {
    name: 'browser_analyze_screenshot',
    description: 'Takes a screenshot and uses AI to describe what is visible.',
    schema: z.object({
        question: z.string().optional().describe('Specific question about the page (e.g., "Is there an error message?")'),
    }),
    execute: async ({ question }: { question?: string }) => {
        const page = await BrowserManager.getInstance().getPage();

        // Take screenshot
        const buffer = await page.screenshot();
        const base64 = buffer.toString('base64');

        const llm = getLLMProvider();

        if (!llm.analyzeImage) {
            return {
                content: [
                    {
                        type: 'image' as const,
                        data: base64,
                        mimeType: 'image/png',
                    },
                    {
                        type: 'text' as const,
                        text: '[AI image analysis not available - screenshot provided above]',
                    },
                ],
            };
        }

        try {
            const prompt = question
                ? `Look at this webpage screenshot and answer: ${question}`
                : 'Describe what you see in this webpage screenshot. Identify key UI elements, any forms, buttons, content, and the overall purpose of the page.';

            const analysis = await llm.analyzeImage(base64, prompt);

            return {
                content: [
                    {
                        type: 'image' as const,
                        data: base64,
                        mimeType: 'image/png',
                    },
                    {
                        type: 'text' as const,
                        text: analysis,
                    },
                ],
            };
        } catch (error) {
            return {
                content: [
                    {
                        type: 'image' as const,
                        data: base64,
                        mimeType: 'image/png',
                    },
                    {
                        type: 'text' as const,
                        text: `Error analyzing screenshot: ${error instanceof Error ? error.message : String(error)}`,
                    },
                ],
                isError: true,
            };
        }
    },
};
