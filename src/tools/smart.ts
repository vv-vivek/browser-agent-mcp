import { z } from 'zod';
import { BrowserManager } from '../browser.js';
import { getLLMProvider } from '../llm.js';

interface ElementInfo {
    selector: string;
    tag: string;
    text: string;
    ariaLabel?: string;
    placeholder?: string;
    id?: string;
    className?: string;
}

// Extract interactive elements from the page
async function getInteractiveElements(page: any): Promise<ElementInfo[]> {
    return await page.evaluate(() => {
        const interactiveSelectors = 'a, button, input, select, textarea, [role="button"], [onclick], [tabindex]';
        const elements = document.querySelectorAll(interactiveSelectors);

        return Array.from(elements).slice(0, 100).map((el, index) => {
            const htmlEl = el as HTMLElement;
            return {
                selector: `[data-smart-index="${index}"]`,
                tag: el.tagName.toLowerCase(),
                text: htmlEl.textContent?.trim().substring(0, 100) || '',
                ariaLabel: el.getAttribute('aria-label') || undefined,
                placeholder: el.getAttribute('placeholder') || undefined,
                id: el.id || undefined,
                className: el.className?.toString().substring(0, 50) || undefined,
            };
        });
    });
}

// Add index attributes to elements for selection
async function addSmartIndexes(page: any): Promise<void> {
    await page.evaluate(() => {
        const interactiveSelectors = 'a, button, input, select, textarea, [role="button"], [onclick], [tabindex]';
        const elements = document.querySelectorAll(interactiveSelectors);
        elements.forEach((el, index) => {
            el.setAttribute('data-smart-index', index.toString());
        });
    });
}

// Find best matching element using text matching (heuristic) or AI
async function findBestMatch(description: string, elements: ElementInfo[]): Promise<ElementInfo | null> {
    const descLower = description.toLowerCase();

    // Try exact text match first
    for (const el of elements) {
        if (el.text.toLowerCase() === descLower) return el;
        if (el.ariaLabel?.toLowerCase() === descLower) return el;
    }

    // Try partial match
    for (const el of elements) {
        if (el.text.toLowerCase().includes(descLower)) return el;
        if (el.ariaLabel?.toLowerCase().includes(descLower)) return el;
        if (el.placeholder?.toLowerCase().includes(descLower)) return el;
    }

    // Try AI matching if available
    const llm = getLLMProvider();
    if (llm.name !== 'heuristic') {
        try {
            const prompt = `Given these interactive elements on a webpage, which one best matches the description "${description}"?
            
Elements:
${elements.slice(0, 30).map((el, i) => `${i}. <${el.tag}> text="${el.text}" aria-label="${el.ariaLabel || ''}" placeholder="${el.placeholder || ''}"`).join('\n')}

Respond with ONLY the number (index) of the best matching element, or -1 if none match.`;

            const response = await llm.generateText(prompt);
            const index = parseInt(response.trim());
            if (!isNaN(index) && index >= 0 && index < elements.length) {
                return elements[index];
            }
        } catch (error) {
            // Fall back to no match
        }
    }

    return null;
}

export const smartClickTool = {
    name: 'browser_smart_click',
    description: 'Clicks an element by natural language description (e.g., "the login button", "submit form").',
    schema: z.object({
        description: z.string().describe('Natural language description of the element to click'),
    }),
    execute: async ({ description }: { description: string }) => {
        const page = await BrowserManager.getInstance().getPage();

        await addSmartIndexes(page);
        const elements = await getInteractiveElements(page);
        const match = await findBestMatch(description, elements);

        if (!match) {
            return {
                content: [{
                    type: 'text' as const,
                    text: `Could not find element matching: "${description}"`,
                }],
                isError: true,
            };
        }

        await page.locator(match.selector).click();

        return {
            content: [{
                type: 'text' as const,
                text: `Clicked: <${match.tag}> "${match.text || match.ariaLabel || 'element'}"`,
            }],
        };
    },
};

export const smartTypeTool = {
    name: 'browser_smart_type',
    description: 'Types text into a field by natural language description (e.g., "the email field", "search box").',
    schema: z.object({
        fieldDescription: z.string().describe('Natural language description of the input field'),
        text: z.string().describe('Text to type into the field'),
        clear: z.boolean().optional().default(true).describe('Clear existing content before typing'),
    }),
    execute: async ({ fieldDescription, text, clear }: { fieldDescription: string; text: string; clear?: boolean }) => {
        const page = await BrowserManager.getInstance().getPage();

        await addSmartIndexes(page);
        const elements = await getInteractiveElements(page);
        // Filter to input-like elements
        const inputElements = elements.filter(el =>
            ['input', 'textarea', 'select'].includes(el.tag) ||
            el.ariaLabel?.toLowerCase().includes('input')
        );

        const match = await findBestMatch(fieldDescription, inputElements.length > 0 ? inputElements : elements);

        if (!match) {
            return {
                content: [{
                    type: 'text' as const,
                    text: `Could not find input field matching: "${fieldDescription}"`,
                }],
                isError: true,
            };
        }

        const element = page.locator(match.selector);
        if (clear !== false) {
            await element.clear();
        }
        await element.fill(text);

        return {
            content: [{
                type: 'text' as const,
                text: `Typed into: <${match.tag}> "${match.placeholder || match.ariaLabel || 'field'}"`,
            }],
        };
    },
};

export const findElementTool = {
    name: 'browser_find_element',
    description: 'Finds an element by natural language description and returns its selector.',
    schema: z.object({
        description: z.string().describe('Natural language description of the element to find'),
    }),
    execute: async ({ description }: { description: string }) => {
        const page = await BrowserManager.getInstance().getPage();

        await addSmartIndexes(page);
        const elements = await getInteractiveElements(page);
        const match = await findBestMatch(description, elements);

        if (!match) {
            return {
                content: [{
                    type: 'text' as const,
                    text: `Could not find element matching: "${description}"`,
                }],
                isError: true,
            };
        }

        // Try to build a more useful selector
        let selector = match.selector;
        if (match.id) selector = `#${match.id}`;
        else if (match.ariaLabel) selector = `[aria-label="${match.ariaLabel}"]`;

        return {
            content: [{
                type: 'text' as const,
                text: JSON.stringify({
                    selector,
                    tag: match.tag,
                    text: match.text,
                    ariaLabel: match.ariaLabel,
                }, null, 2),
            }],
        };
    },
};
