# BrowserAgent MCP — Complete Guide 🌐

## What Is This? (The Simple Explanation)

Imagine you're Claude (an AI), but you're **blind** — you can't see websites, click buttons, or fill out forms. That's how AI normally works.

**BrowserAgent MCP gives AI "eyes and hands" on the internet.**

It's like hiring a virtual assistant who can:
- 🖥️ **Open websites** on your behalf
- 👀 **See** what's on screen (via screenshots)
- 🖱️ **Click** buttons and links
- ⌨️ **Type** into forms
- 📋 **Read** content from pages

---

## Real-World Analogy

Think of it like this:

| Without BrowserAgent | With BrowserAgent |
|---------------------|-------------------|
| AI is like a person locked in a room with only a phone | AI is like a person with a computer and full internet access |
| "I can't check prices, I can only tell you what I know" | "Let me check the current price on Amazon for you" |
| "I can't fill out forms for you" | "I just submitted your job application" |

---

## The 37 Tools Explained (With Real Examples)

### 🔹 CORE TOOLS (The Basics)

#### 1. `browser_navigate(url)`
**What it does:** Opens a website, just like typing a URL in your browser.

**Real-world examples:**
```
"Go to Amazon.com" → browser_navigate("https://amazon.com")
"Open my bank's website" → browser_navigate("https://mybank.com")
"Check Hacker News" → browser_navigate("https://news.ycombinator.com")
```

---

#### 2. `browser_screenshot()`
**What it does:** Takes a picture of what's currently on screen.

**Real-world examples:**
- **Verification:** "Take a screenshot to prove my order went through"
- **Debugging:** "Show me what the page looks like right now"
- **Monitoring:** "Capture the current stock price display"

---

#### 3. `browser_click(selector)`
**What it does:** Clicks on buttons, links, or any clickable element.

**Real-world examples:**
```
"Click the Login button" → browser_click("#login-btn")
"Add item to cart" → browser_click(".add-to-cart")
"Accept cookies" → browser_click("[data-accept-cookies]")
```

---

#### 4. `browser_type(selector, text)`
**What it does:** Types text into input fields, like filling out a form.

**Real-world examples:**
```
"Enter my email" → browser_type("#email", "john@example.com")
"Search for laptops" → browser_type(".search-box", "gaming laptop")
"Type my password" → browser_type("#password", "secret123")
```

---

#### 5. `browser_get_content(selector)`
**What it does:** Reads text from the page.

**Real-world examples:**
```
"What's the price?" → browser_get_content(".product-price")
"Read the article" → browser_get_content("article")
"Get the error message" → browser_get_content(".error")
```

---

### 🔹 PHASE 1: ESSENTIAL TOOLS (Navigation & Control)

#### 6-7. `browser_scroll(direction)` & `browser_wait(selector)`
**What they do:**
- Scroll: Move up/down the page (like using your mousewheel)
- Wait: Pause until something appears (for slow-loading content)

**Real-world examples:**
```
"Scroll to see more products" → browser_scroll("down", 500)
"Wait for the loading spinner to disappear" → browser_wait(".spinner", 10000, "hidden")
"Scroll to the comments section" → browser_scroll({selector: "#comments"})
```

---

#### 8-9. `browser_back()` & `browser_forward()`
**What they do:** Navigate browser history (like hitting ← → buttons).

**Real-world examples:**
```
"Go back to the search results" → browser_back()
"I clicked back by mistake, go forward" → browser_forward()
```

---

#### 10-11. `browser_get_url()` & `browser_get_title()`
**What they do:** Tell you the current page URL and title.

**Real-world examples:**
```
"What page am I on?" → browser_get_url() → "https://amazon.com/cart"
"What's the page title?" → browser_get_title() → "Your Shopping Cart - Amazon"
```

---

### 🔹 PHASE 2: POWER TOOLS (Advanced Interaction)

#### 12. `browser_hover(selector)`
**What it does:** Hovers mouse over an element (triggers dropdown menus, tooltips).

**Real-world examples:**
```
"Hover over the account menu to see options" → browser_hover("#account-menu")
"Show the tooltip on this button" → browser_hover(".info-icon")
```

---

#### 13. `browser_select(selector, value)`
**What it does:** Picks an option from dropdown menus.

**Real-world examples:**
```
"Select 'Large' size" → browser_select("#size-dropdown", "large")
"Choose United States as country" → browser_select("#country", {label: "United States"})
"Pick the 3rd option" → browser_select("#options", {index: 2})
```

---

#### 14. `browser_check(selector)`
**What it does:** Checks or unchecks checkboxes.

**Real-world examples:**
```
"Accept terms and conditions" → browser_check("#terms-checkbox")
"Unsubscribe from newsletter" → browser_check("#newsletter", false)
"Select all items" → browser_check(".item-checkbox", true)
```

---

#### 15. `browser_upload(selector, filePath)`
**What it does:** Uploads files to websites.

**Real-world examples:**
```
"Upload my resume" → browser_upload("#resume-input", "C:/Documents/resume.pdf")
"Attach a photo" → browser_upload(".photo-upload", "/path/to/photo.jpg")
```

---

#### 16. `browser_eval(script)`
**What it does:** Runs custom JavaScript code in the browser.

**Real-world examples:**
```
"Get all prices on the page" → browser_eval("Array.from(document.querySelectorAll('.price')).map(p => p.textContent)")
"Get total cart value" → browser_eval("document.querySelector('.cart-total').innerText")
"Scroll to bottom" → browser_eval("window.scrollTo(0, document.body.scrollHeight)")
```

---

#### 17-18. `browser_get_links()` & `browser_get_html()`
**What they do:**
- Get Links: Extract all URLs from a page (for crawling/scraping)
- Get HTML: Get the raw HTML code of the page

**Real-world examples:**
```
"Get all product links" → browser_get_links(".products")
"Extract the page source" → browser_get_html()
"Get HTML of the pricing table" → browser_get_html("#pricing-table")
```

---

### 🔹 PHASE 3: AI-ENHANCED TOOLS (Smart Automation)

These tools use **AI (Gemini API)** to understand natural language!

#### 19. `browser_smart_click(description)`
**What it does:** Click by describing what you want (no CSS selectors needed!)

**Real-world examples:**
```
"Click the blue login button" → browser_smart_click("blue login button")
"Press the submit button" → browser_smart_click("submit")
"Click on the shopping cart" → browser_smart_click("shopping cart icon")
```

**Why it's amazing:** You don't need to know CSS selectors. Just describe it like talking to a human!

---

#### 20. `browser_smart_type(fieldDescription, text)`
**What it does:** Type into fields by describing them naturally.

**Real-world examples:**
```
"Enter email into the email field" → browser_smart_type("email field", "john@example.com")
"Fill in the search box with 'laptop'" → browser_smart_type("search box", "laptop")
```

---

#### 21. `browser_find_element(description)`
**What it does:** Find an element by describing it, returns its selector.

**Real-world examples:**
```
"Find the checkout button" → browser_find_element("checkout button")
→ Returns: { selector: "#checkout-btn", tag: "button", text: "Checkout" }
```

---

#### 22. `browser_summarize()`
**What it does:** AI generates a summary of the page content.

**Real-world examples:**
```
"Summarize this article" → browser_summarize()
→ Returns: "This article discusses the top 10 programming languages for 2024, with Python ranked #1..."

"Focus on pricing" → browser_summarize({focus: "pricing"})
→ Returns: "The pricing plans are: Basic ($9/mo), Pro ($29/mo), Enterprise (custom)..."
```

---

#### 23. `browser_analyze_screenshot()`
**What it does:** AI looks at a screenshot and describes what it sees.

**Real-world examples:**
```
"What's on the screen?" → browser_analyze_screenshot()
→ Returns: "The page shows an e-commerce product listing with 6 items, a search bar at the top..."

"Is there an error?" → browser_analyze_screenshot({question: "Is there any error message visible?"})
→ Returns: "Yes, there's a red error banner saying 'Invalid credit card number'"
```

---

### 🔹 PHASE 4: SESSION TOOLS (Persistence & Multi-Tab)

#### 24-26. Cookie Tools
**What they do:** Manage browser cookies (for staying logged in).

**Real-world examples:**
```
"Save my login session" → browser_get_cookies() → Store for later
"Restore my session" → browser_set_cookies(savedCookies)
"Log out everywhere" → browser_clear_cookies()
```

---

#### 27-29. Storage Tools
**What they do:** Access localStorage/sessionStorage (website data).

**Real-world examples:**
```
"Get my cart items from storage" → browser_get_storage("local", "cart")
"Save a preference" → browser_set_storage("local", "theme", "dark")
"Clear all saved data" → browser_clear_storage("local")
```

---

#### 30-33. Tab Management
**What they do:** Work with multiple browser tabs.

**Real-world examples:**
```
"Open a new tab to compare prices" → browser_new_tab("https://amazon.com")
"Switch to the first tab" → browser_switch_tab("main")
"Close this tab" → browser_close_tab()
"What tabs are open?" → browser_list_tabs()
```

---

#### 34. `browser_save_pdf()`
**What it does:** Save the current page as a PDF.

**Real-world examples:**
```
"Save this invoice as PDF" → browser_save_pdf("invoice.pdf")
"Download the receipt" → browser_save_pdf("C:/Downloads/receipt.pdf")
```

---

### 🔹 PHASE 5: MONITORING TOOLS (Debugging & Testing)

#### 35-37. Network Request Tools
**What they do:** Capture and inspect network requests (API calls).

**Real-world examples:**
```
"Start monitoring network" → browser_capture_requests_start()
"Show me all API calls" → browser_get_requests()
→ Returns: [{ url: "api.example.com/products", method: "GET", status: 200 }...]
```

---

#### 38-40. Console Tools
**What they do:** Capture browser console logs (for debugging).

**Real-world examples:**
```
"Start listening to console" → browser_console_start()
"Show me any errors" → browser_get_console({level: "error"})
→ Returns: [{ type: "error", text: "Failed to load image", timestamp: ... }]
```

---

#### 41. `browser_get_performance()`
**What it does:** Get page performance metrics (Core Web Vitals).

**Real-world examples:**
```
"How fast did the page load?" → browser_get_performance()
→ Returns: {
    loadTime: 2340,  // ms
    firstByte: 180,
    largestContentfulPaint: 1200,
    cumulativeLayoutShift: 0.05
  }
```

---

#### 42. `browser_a11y_check()`
**What it does:** Accessibility audit (check for screen reader compatibility, etc.).

**Real-world examples:**
```
"Is this page accessible?" → browser_a11y_check()
→ Returns: {
    passed: false,
    issues: ["Image without alt text", "Button without label"],
    stats: { images: 5, imagesWithAlt: 3 }
  }
```

---

## 🎯 Complete Use Case Examples

### Example 1: Automated Job Application
```
1. browser_navigate("https://careers.company.com")
2. browser_smart_click("Job Listings")
3. browser_smart_type("search box", "Software Engineer")
4. browser_smart_click("first job result")
5. browser_smart_click("Apply Now")
6. browser_smart_type("name field", "John Doe")
7. browser_smart_type("email field", "john@email.com")
8. browser_upload("#resume", "C:/resume.pdf")
9. browser_check("terms checkbox")
10. browser_smart_click("Submit Application")
11. browser_screenshot() → Proof of submission
```

### Example 2: Price Monitoring Bot
```
1. browser_navigate("https://amazon.com/product/12345")
2. browser_get_content(".price") → "$199.99"
3. browser_screenshot()
4. If price < $180: alert user!
```

### Example 3: Automated Testing
```
1. browser_navigate("https://myapp.com/login")
2. browser_smart_type("email field", "test@test.com")
3. browser_smart_type("password field", "password123")
4. browser_smart_click("login button")
5. browser_wait(".dashboard")
6. browser_screenshot() → Verify dashboard loaded
7. browser_get_performance() → Check load times
8. browser_a11y_check() → Check accessibility
```

---

## 💡 Key Takeaways

1. **It's an MCP Server** — Designed to work with Claude Desktop
2. **37 Tools** covering navigation, interaction, AI, sessions, and monitoring
3. **AI-Enhanced** — Uses Gemini API for natural language element finding
4. **Cross-Platform** — Works on Windows, Mac, Linux
5. **Real Browser** — Uses Playwright (Chromium) for actual browser control
6. **No UI** — Runs headlessly (invisible browser) or visible for debugging

---

## 🚀 Getting Started

```bash
# 1. Build
cd browser-agent-mcp
npm install
npm run build

# 2. Set Gemini API (optional, for AI tools)
set GEMINI_API_KEY=your_api_key

# 3. Configure Claude Desktop
# Add to claude_desktop_config.json
```

Now Claude can browse the web for you! 🎉
