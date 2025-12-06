# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 2.x.x   | :white_check_mark: |
| < 2.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability, please:

1. **Do NOT** open a public issue
2. Email: dmvivek.vv@gmail.com
3. Include detailed steps to reproduce

We'll respond within 48 hours.

---

## Security Considerations

### ⚠️ Tools with Elevated Risk

#### 1. `browser_eval` — JavaScript Execution
**Risk:** Executes arbitrary JavaScript in the browser context.

**Mitigations:**
- Runs in browser sandbox (not Node.js)
- Cannot access local filesystem
- Cannot execute system commands
- Isolated to the browser page context

**User Responsibility:** Only use with trusted prompts.

---

#### 2. `browser_upload` — File Upload
**Risk:** Can upload files from the local filesystem.

**Mitigations:**
- Requires explicit file path
- Only uploads to websites (cannot read file contents to AI)

**User Responsibility:** Be careful what files you allow to be uploaded.

---

#### 3. AI-Enhanced Tools (`browser_smart_click`, etc.)
**Risk:** May send page content to Gemini API.

**Mitigations:**
- Only enabled if `GEMINI_API_KEY` is set
- Without API key, uses local heuristics only
- No user data is logged or stored

**User Responsibility:** Review Gemini API's privacy policy if using AI features.

---

### ✅ Security Best Practices Followed

| Practice | Status |
|----------|--------|
| No hardcoded secrets | ✅ |
| API keys via environment variables | ✅ |
| No sensitive data in logs | ✅ |
| MIT License (legal clarity) | ✅ |
| Browser sandbox for JS execution | ✅ |

---

### 🔒 Recommended User Practices

1. **Use in isolated environment** — Consider running in Docker
2. **Review AI prompts** — Don't blindly execute AI-suggested actions on sensitive sites
3. **Secure your API keys** — Use environment variables, never commit them
4. **Use with trusted MCP clients** — Only use with official Claude Desktop

---

## Data Flow

```
User → Claude Desktop → MCP Server → Playwright Browser
                                    ↓
                              (Optional) Gemini API
```

**What data goes where:**
- **Playwright:** Only visits URLs you specify
- **Gemini API:** Page content (if AI features enabled)
- **Local storage:** Screenshots/PDFs saved locally
- **No telemetry:** We don't collect any usage data

---

## Changelog

### v2.0.0
- Initial public release
- Security review completed
