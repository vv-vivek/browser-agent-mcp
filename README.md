# BrowserAgent MCP 🌐

> Give AI the ability to browse the web. 37 automation tools for Claude Desktop.

[![npm version](https://badge.fury.io/js/browser-agent-mcp.svg)](https://www.npmjs.com/package/browser-agent-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## What It Does

BrowserAgent MCP is a [Model Context Protocol](https://modelcontextprotocol.io/) server that gives AI agents real browser control:

- 🌐 **Navigate** to any website
- 📸 **Screenshot** pages
- 🖱️ **Click** buttons and links
- ⌨️ **Type** into forms
- 📜 **Scroll** and wait for elements
- 🤖 **AI-powered** element finding (optional)

## Quick Start

### 1. Install

```bash
npm install -g @vivek3/browser-agent-mcp
npx playwright install chromium
```

### 2. Configure Claude Desktop

Add to your `claude_desktop_config.json`:

**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`  
**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "browser-agent": {
      "command": "npx",
      "args": ["@vivek3/browser-agent-mcp"]
    }
  }
}
```

### 3. Use It

Restart Claude Desktop and try:
- *"Go to news.ycombinator.com and tell me the top 3 stories"*
- *"Take a screenshot of google.com"*
- *"Fill out this form..."*

## All 37 Tools

### Core
| Tool | Description |
|------|-------------|
| `browser_navigate` | Go to a URL |
| `browser_screenshot` | Capture the page |
| `browser_click` | Click an element |
| `browser_type` | Type text |
| `browser_get_content` | Read page text |

### Navigation
| Tool | Description |
|------|-------------|
| `browser_scroll` | Scroll up/down |
| `browser_wait` | Wait for element |
| `browser_back` | Go back |
| `browser_forward` | Go forward |
| `browser_get_url` | Get current URL |
| `browser_get_title` | Get page title |

### Forms & Interaction
| Tool | Description |
|------|-------------|
| `browser_hover` | Hover over element |
| `browser_select` | Choose from dropdown |
| `browser_check` | Toggle checkbox |
| `browser_upload` | Upload file |
| `browser_eval` | Run JavaScript |
| `browser_get_links` | Extract all URLs |
| `browser_get_html` | Get HTML source |

### AI-Enhanced (requires Gemini API key)
| Tool | Description |
|------|-------------|
| `browser_smart_click` | Click by description |
| `browser_smart_type` | Type by field description |
| `browser_find_element` | Find by natural language |
| `browser_summarize` | AI page summary |
| `browser_analyze_screenshot` | Visual analysis |

### Session & Tabs
| Tool | Description |
|------|-------------|
| `browser_get_cookies` | Get cookies |
| `browser_set_cookies` | Set cookies |
| `browser_clear_cookies` | Clear cookies |
| `browser_get_storage` | Get localStorage |
| `browser_set_storage` | Set localStorage |
| `browser_new_tab` | Open new tab |
| `browser_switch_tab` | Switch tabs |
| `browser_close_tab` | Close tab |
| `browser_list_tabs` | List all tabs |
| `browser_save_pdf` | Save as PDF |

### Monitoring
| Tool | Description |
|------|-------------|
| `browser_capture_requests_start` | Monitor network |
| `browser_get_requests` | Get network log |
| `browser_console_start` | Monitor console |
| `browser_get_console` | Get console log |
| `browser_get_performance` | Core Web Vitals |
| `browser_a11y_check` | Accessibility audit |

## AI Features (Multiple LLM Options)

Set **one** of these environment variables:

| Provider | Environment Variable | Free Tier? |
|----------|---------------------|------------|
| **Google Gemini** | `GEMINI_API_KEY` | ✅ Yes |
| **OpenAI GPT-4** | `OPENAI_API_KEY` | ❌ Paid |
| **Anthropic Claude** | `ANTHROPIC_API_KEY` | ❌ Paid |
| **Ollama (Local)** | `LLM_PROVIDER=ollama` | ✅ Free (local) |

```bash
# Example: Use Gemini (free)
set GEMINI_API_KEY=your_key_here

# Example: Use OpenAI
set OPENAI_API_KEY=sk-...

# Example: Use local Ollama
set LLM_PROVIDER=ollama
# Make sure Ollama is running: ollama serve
```

**Auto-detection:** If multiple keys are set, priority is: Gemini → OpenAI → Anthropic → Ollama

## Security

See [SECURITY.md](./SECURITY.md) for security policy and considerations.

**Key points:**
- `browser_eval` runs in browser sandbox (safe)
- No data is logged or stored
- API keys read from environment only

## License

MIT © [vv-vivek](https://github.com/vv-vivek)

---

⭐ Star this repo if you find it useful!
