# Contributing to BrowserAgent MCP

Thank you for your interest in contributing! 🎉

## 🚀 Quick Start

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/browser-agent-mcp.git`
3. Install dependencies: `npm install`
4. Build: `npm run build`
5. Create a branch: `git checkout -b feature/your-feature`

## 📝 Development

### Project Structure

```
src/
├── index.ts          # Entry point, registers all tools
├── browser.ts        # BrowserManager (multi-tab support)
├── llm.ts            # LLM provider abstraction (Gemini)
└── tools/            # All browser automation tools
    ├── navigate.ts   # Core navigation
    ├── scroll.ts     # Scrolling
    ├── smart.ts      # AI-enhanced tools
    └── ...
```

### Adding a New Tool

1. Create a file in `src/tools/your-tool.ts`:
```typescript
import { z } from 'zod';
import { BrowserManager } from '../browser.js';

export const yourTool = {
    name: 'browser_your_tool',
    description: 'What this tool does',
    schema: z.object({
        param: z.string().describe('Parameter description'),
    }),
    execute: async ({ param }) => {
        const page = await BrowserManager.getInstance().getPage();
        // Your implementation
        return {
            content: [{ type: 'text' as const, text: 'Result' }],
        };
    },
};
```

2. Import and register in `src/index.ts`:
```typescript
import { yourTool } from './tools/your-tool.js';
registerTool(yourTool);
```

3. Build and test: `npm run build`

## 🧪 Testing

```bash
# Build the project
npm run build

# Start the server
node dist/index.js
```

Test with Claude Desktop by adding to your config.

## 📋 Pull Request Guidelines

1. **One feature per PR** — Keep PRs focused
2. **Update README** — If adding new tools
3. **Test thoroughly** — Ensure build passes
4. **Clear description** — Explain what and why

## 🐛 Reporting Issues

Use [GitHub Issues](https://github.com/YOUR_USERNAME/browser-agent-mcp/issues) with:
- Clear description
- Steps to reproduce
- Expected vs actual behavior
- System info (OS, Node version)

## 💬 Questions?

Open a [Discussion](https://github.com/YOUR_USERNAME/browser-agent-mcp/discussions) for questions, ideas, or feedback.

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.
