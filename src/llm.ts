/**
 * LLM Provider Interface
 * Abstraction layer for AI inference - supports Gemini, OpenAI, Anthropic, Ollama
 */

export interface LLMProvider {
    name: string;
    generateText(prompt: string): Promise<string>;
    analyzeImage?(imageBase64: string, prompt: string): Promise<string>;
}

// Environment variables for API keys
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const LLM_PROVIDER = process.env.LLM_PROVIDER || ''; // Force a specific provider

// ============================================
// GEMINI PROVIDER (Google)
// ============================================
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

// ============================================
// OPENAI PROVIDER (GPT-4, GPT-4o, etc.)
// ============================================
export class OpenAIProvider implements LLMProvider {
    name = 'openai';
    private apiKey: string;
    private model: string;

    constructor(apiKey?: string, model: string = 'gpt-4o-mini') {
        this.apiKey = apiKey || OPENAI_API_KEY;
        this.model = model;
    }

    async generateText(prompt: string): Promise<string> {
        if (!this.apiKey) {
            throw new Error('OPENAI_API_KEY environment variable not set');
        }

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify({
                model: this.model,
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.2,
                max_tokens: 1024,
            }),
        });

        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data.choices?.[0]?.message?.content || '';
    }

    async analyzeImage(imageBase64: string, prompt: string): Promise<string> {
        if (!this.apiKey) {
            throw new Error('OPENAI_API_KEY environment variable not set');
        }

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify({
                model: 'gpt-4o', // Vision requires gpt-4o or gpt-4-vision
                messages: [{
                    role: 'user',
                    content: [
                        { type: 'text', text: prompt },
                        {
                            type: 'image_url',
                            image_url: { url: `data:image/png;base64,${imageBase64}` },
                        },
                    ],
                }],
                temperature: 0.2,
                max_tokens: 2048,
            }),
        });

        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data.choices?.[0]?.message?.content || '';
    }
}

// ============================================
// ANTHROPIC PROVIDER (Claude)
// ============================================
export class AnthropicProvider implements LLMProvider {
    name = 'anthropic';
    private apiKey: string;
    private model: string;

    constructor(apiKey?: string, model: string = 'claude-3-haiku-20240307') {
        this.apiKey = apiKey || ANTHROPIC_API_KEY;
        this.model = model;
    }

    async generateText(prompt: string): Promise<string> {
        if (!this.apiKey) {
            throw new Error('ANTHROPIC_API_KEY environment variable not set');
        }

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': this.apiKey,
                'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
                model: this.model,
                max_tokens: 1024,
                messages: [{ role: 'user', content: prompt }],
            }),
        });

        if (!response.ok) {
            throw new Error(`Anthropic API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data.content?.[0]?.text || '';
    }

    async analyzeImage(imageBase64: string, prompt: string): Promise<string> {
        if (!this.apiKey) {
            throw new Error('ANTHROPIC_API_KEY environment variable not set');
        }

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': this.apiKey,
                'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
                model: 'claude-3-haiku-20240307', // Vision capable model
                max_tokens: 2048,
                messages: [{
                    role: 'user',
                    content: [
                        {
                            type: 'image',
                            source: {
                                type: 'base64',
                                media_type: 'image/png',
                                data: imageBase64,
                            },
                        },
                        { type: 'text', text: prompt },
                    ],
                }],
            }),
        });

        if (!response.ok) {
            throw new Error(`Anthropic API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data.content?.[0]?.text || '';
    }
}

// ============================================
// OLLAMA PROVIDER (Local LLMs)
// ============================================
export class OllamaProvider implements LLMProvider {
    name = 'ollama';
    private baseUrl: string;
    private model: string;

    constructor(baseUrl?: string, model: string = 'llama3.2') {
        this.baseUrl = baseUrl || OLLAMA_BASE_URL;
        this.model = process.env.OLLAMA_MODEL || model;
    }

    async generateText(prompt: string): Promise<string> {
        const response = await fetch(`${this.baseUrl}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: this.model,
                prompt: prompt,
                stream: false,
            }),
        });

        if (!response.ok) {
            throw new Error(`Ollama API error: ${response.status} - Is Ollama running at ${this.baseUrl}?`);
        }

        const data = await response.json();
        return data.response || '';
    }

    async analyzeImage(imageBase64: string, prompt: string): Promise<string> {
        // Ollama vision requires llava or similar model
        const response = await fetch(`${this.baseUrl}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: process.env.OLLAMA_VISION_MODEL || 'llava',
                prompt: prompt,
                images: [imageBase64],
                stream: false,
            }),
        });

        if (!response.ok) {
            throw new Error(`Ollama API error: ${response.status} - Is Ollama running with a vision model?`);
        }

        const data = await response.json();
        return data.response || '';
    }
}

// ============================================
// HEURISTIC PROVIDER (No API - Fallback)
// ============================================
export class HeuristicProvider implements LLMProvider {
    name = 'heuristic';

    async generateText(prompt: string): Promise<string> {
        return '[No AI configured - Set one of: GEMINI_API_KEY, OPENAI_API_KEY, ANTHROPIC_API_KEY, or run Ollama locally]';
    }

    async analyzeImage(imageBase64: string, prompt: string): Promise<string> {
        return '[No AI configured - Set an API key for AI-powered image analysis]';
    }
}

// ============================================
// FACTORY FUNCTION - Auto-detect provider
// ============================================
export function getLLMProvider(): LLMProvider {
    // Allow forcing a specific provider
    const forcedProvider = LLM_PROVIDER.toLowerCase();

    if (forcedProvider === 'gemini' && GEMINI_API_KEY) {
        return new GeminiProvider();
    }
    if (forcedProvider === 'openai' && OPENAI_API_KEY) {
        return new OpenAIProvider();
    }
    if (forcedProvider === 'anthropic' && ANTHROPIC_API_KEY) {
        return new AnthropicProvider();
    }
    if (forcedProvider === 'ollama') {
        return new OllamaProvider();
    }

    // Auto-detect based on available API keys (priority order)
    if (GEMINI_API_KEY) {
        return new GeminiProvider();
    }
    if (OPENAI_API_KEY) {
        return new OpenAIProvider();
    }
    if (ANTHROPIC_API_KEY) {
        return new AnthropicProvider();
    }

    // Check if Ollama might be running (no key needed)
    // User can set LLM_PROVIDER=ollama to force it

    return new HeuristicProvider();
}

// Export provider info for debugging
export function getAvailableProviders(): string[] {
    const providers: string[] = [];
    if (GEMINI_API_KEY) providers.push('gemini');
    if (OPENAI_API_KEY) providers.push('openai');
    if (ANTHROPIC_API_KEY) providers.push('anthropic');
    providers.push('ollama (if running locally)');
    if (providers.length === 1) providers.unshift('heuristic (default)');
    return providers;
}
