# BrowserAgent MCP 🌐 v2.0.0

**BrowserAgent MCP** is a Model Context Protocol server that gives AI agents (like Claude) the ability to interact with the web using a real, headless browser.

## 🚀 What it Does

Acts as the "eyes and hands" of the AI on the internet with **37 tools** across 5 categories:

### Core Tools
| Tool | Description |
|------|-------------|
| `browser_navigate(url)` | Go to a website |
| `browser_screenshot()` | Take a picture of the page |
| `browser_click(selector)` | Click an element |
| `browser_type(selector, text)` | Type into a form field |
| `browser_get_content(selector?)` | Read text from the page |

### Phase 1: Essential Tools
| Tool | Description |
|------|-------------|
| `browser_scroll(direction, amount?)` | Scroll page/to element |
| `browser_wait(selector, timeout?)` | Wait for elements |
| `browser_back()` / `browser_forward()` | Navigate history |
| `browser_get_url()` / `browser_get_title()` | Get page info |

### Phase 2: Power Tools
| Tool | Description |
|------|-------------|
| `browser_hover(selector)` | Trigger hover states |
| `browser_select(selector, value)` | Choose from dropdowns |
| `browser_check(selector)` | Toggle checkboxes |
| `browser_upload(selector, filePath)` | Upload files |
| `browser_eval(script)` | Execute JavaScript |
| `browser_get_links()` / `browser_get_html()` | Extract content |

### Phase 3: AI-Enhanced Tools (Gemini API)
| Tool | Description |
|------|-------------|
| `browser_smart_click(description)` | Click by natural language |
| `browser_smart_type(field, text)` | Type by field description |
| `browser_find_element(description)` | Find elements by AI |
| `browser_summarize()` | AI page summary |
| `browser_analyze_screenshot()` | Visual analysis |

### Phase 4: Session & Auth Tools
| Tool | Description |
|------|-------------|
| `browser_get/set/clear_cookies()` | Cookie management |
| `browser_get/set/clear_storage()` | localStorage control |
| `browser_new_tab(url?)` | Multi-tab support |
| `browser_switch_tab(id)` / `browser_close_tab()` | Tab management |
| `browser_list_tabs()` | See all tabs |
| `browser_save_pdf(path?)` | Export as PDF |

### Phase 5: Monitoring Tools
| Tool | Description |
|------|-------------|
| `browser_capture_requests_start()` | Start network capture |
| `browser_get_requests()` | Get captured requests |
| `browser_console_start()` | Start console capture |
| `browser_get_console()` | Get console logs |
| `browser_get_performance()` | Core Web Vitals |
| `browser_a11y_check()` | Accessibility audit |

## 📦 Installation & Usage

### 1. Build
```bash
npm install
npm run build
```

### 2. Configure Claude Desktop
Add to `claude_desktop_config.json`:
```json
"browser-agent": {
  "command": "node",
  "args": ["c:\\Users\\dmviv\\antigrav\\browser-agent-mcp\\dist\\index.js"]
}
```

### 3. AI Features (Optional)
Set `GEMINI_API_KEY` environment variable for AI-enhanced tools.

## 💡 Applications
- **Automated Testing** — Visual regression, form testing
- **Data Collection** — Web scraping, price monitoring
- **Visual Verification** — Deployment checks
- **Accessibility Audits** — a11y compliance
- **Performance Monitoring** — Core Web Vitals
