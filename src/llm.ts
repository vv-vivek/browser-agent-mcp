/**
 * LLM Provider Interface
 * Abstraction layer for AI inference - can switch between Gemini, Claude, GPT
 */

export interface LLMProvider {
    name: string;
    generateText(prompt: string): Promise<string>;
    analyzeImage?(imageBase64: string, prompt: string): Promise<string>;
}

// Environment variable for API key
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

export class GeminiProvider implements LLMProvider {
    name = 'gemini';
    private apiKey: string;
    private model: string;

    constructor(apiKey?: string, model: string = 'gemini-1.5-flash') {
        this.apiKey = apiKey || GEMINI_API_KEY;
        this.model = model;
    }

    async generateText(prompt: string): Promise<string> {
        if (!this.apiKey) {
            throw new Error('GEMINI_API_KEY environment variable not set');
        }

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.2,
                        maxOutputTokens: 1024,
                    },
                }),
            }
        );

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    }

    async analyzeImage(imageBase64: string, prompt: string): Promise<string> {
        if (!this.apiKey) {
            throw new Error('GEMINI_API_KEY environment variable not set');
        }

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            { text: prompt },
                            {
                                inlineData: {
                                    mimeType: 'image/png',
                                    data: imageBase64,
                                },
                            },
                        ],
                    }],
                    generationConfig: {
                        temperature: 0.2,
                        maxOutputTokens: 2048,
                    },
                }),
            }
        );

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    }
}

// Fallback provider using heuristics when no API key is available
export class HeuristicProvider implements LLMProvider {
    name = 'heuristic';

    async generateText(prompt: string): Promise<string> {
        // Simple pattern matching for common prompts
        return '[Heuristic mode - no AI API configured]';
    }

    async analyzeImage(imageBase64: string, prompt: string): Promise<string> {
        return '[Heuristic mode - no AI API configured. Set GEMINI_API_KEY for AI analysis]';
    }
}

// Factory function to get the appropriate provider
export function getLLMProvider(): LLMProvider {
    if (GEMINI_API_KEY) {
        return new GeminiProvider();
    }
    return new HeuristicProvider();
}
