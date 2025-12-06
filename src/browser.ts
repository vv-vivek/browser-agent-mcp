import { chromium, Browser, Page, BrowserContext } from 'playwright';

// Environment variables for configuration
const BROWSER_PROXY = process.env.BROWSER_PROXY || ''; // e.g., http://user:pass@proxy:8080
const BROWSER_HEADLESS = process.env.BROWSER_HEADLESS === 'true';
const BROWSER_SLOW_MO = parseInt(process.env.BROWSER_SLOW_MO || '0', 10);

export class BrowserManager {
    private static instance: BrowserManager;
    private browser: Browser | null = null;
    private context: BrowserContext | null = null;
    private pages: Map<string, Page> = new Map();
    private activeTabId: string = 'main';
    private tabCounter: number = 0;
    private isRecording: boolean = false;
    private recordingPath: string | null = null;

    private constructor() { }

    public static getInstance(): BrowserManager {
        if (!BrowserManager.instance) {
            BrowserManager.instance = new BrowserManager();
        }
        return BrowserManager.instance;
    }

    public async getBrowser(): Promise<Browser> {
        if (!this.browser) {
            const launchOptions: any = {
                headless: BROWSER_HEADLESS,
                slowMo: BROWSER_SLOW_MO,
            };

            // Proxy support
            if (BROWSER_PROXY) {
                launchOptions.proxy = { server: BROWSER_PROXY };
            }

            this.browser = await chromium.launch(launchOptions);
        }
        return this.browser;
    }

    public async getPage(): Promise<Page> {
        if (!this.browser) {
            await this.getBrowser();
        }
        if (!this.context) {
            const contextOptions: any = {
                // Stealth-like settings
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                viewport: { width: 1920, height: 1080 },
                locale: 'en-US',
                timezoneId: 'America/New_York',
            };

            // Video recording support
            if (this.isRecording && this.recordingPath) {
                contextOptions.recordVideo = {
                    dir: this.recordingPath,
                    size: { width: 1280, height: 720 },
                };
            }

            this.context = await this.browser!.newContext(contextOptions);

            // Additional stealth: override navigator properties
            await this.context.addInitScript(() => {
                // Hide webdriver
                Object.defineProperty(navigator, 'webdriver', { get: () => undefined });

                // Mock plugins
                Object.defineProperty(navigator, 'plugins', {
                    get: () => [1, 2, 3, 4, 5],
                });

                // Mock languages
                Object.defineProperty(navigator, 'languages', {
                    get: () => ['en-US', 'en'],
                });
            });
        }

        let page = this.pages.get(this.activeTabId);
        if (!page) {
            page = await this.context.newPage();
            this.pages.set(this.activeTabId, page);
        }
        return page;
    }

    public async startRecording(outputDir: string): Promise<void> {
        this.isRecording = true;
        this.recordingPath = outputDir;
        // Recording will be applied to new contexts
    }

    public async stopRecording(): Promise<string | null> {
        this.isRecording = false;
        const path = this.recordingPath;
        this.recordingPath = null;

        // Close context to save video
        if (this.context) {
            const pages = this.context.pages();
            for (const page of pages) {
                const video = page.video();
                if (video) {
                    return await video.path();
                }
            }
        }
        return path;
    }

    public async newTab(url?: string): Promise<string> {
        if (!this.browser) {
            await this.getPage(); // Initialize browser
        }

        this.tabCounter++;
        const tabId = `tab-${this.tabCounter}`;
        const page = await this.context!.newPage();

        if (url) {
            await page.goto(url);
        }

        this.pages.set(tabId, page);
        this.activeTabId = tabId;

        return tabId;
    }

    public async switchTab(tabId: string): Promise<boolean> {
        if (this.pages.has(tabId)) {
            this.activeTabId = tabId;
            return true;
        }
        return false;
    }

    public async closeTab(tabId?: string): Promise<boolean> {
        const id = tabId || this.activeTabId;
        const page = this.pages.get(id);

        if (!page) return false;

        await page.close();
        this.pages.delete(id);

        // Switch to another tab if closing active
        if (id === this.activeTabId) {
            const remaining = Array.from(this.pages.keys());
            this.activeTabId = remaining[0] || 'main';
        }

        return true;
    }

    public listTabs(): Array<{ id: string; url: string; title: string }> {
        const tabs: Array<{ id: string; url: string; title: string }> = [];
        for (const [id, page] of this.pages) {
            tabs.push({
                id,
                url: page.url(),
                title: '', // Title requires async
            });
        }
        return tabs;
    }

    public async getTabsWithTitles(): Promise<Array<{ id: string; url: string; title: string; active: boolean }>> {
        const tabs: Array<{ id: string; url: string; title: string; active: boolean }> = [];
        for (const [id, page] of this.pages) {
            tabs.push({
                id,
                url: page.url(),
                title: await page.title(),
                active: id === this.activeTabId,
            });
        }
        return tabs;
    }

    public getActiveTabId(): string {
        return this.activeTabId;
    }

    public getContext(): BrowserContext | null {
        return this.context;
    }

    public async close() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
            this.context = null;
            this.pages.clear();
            this.activeTabId = 'main';
        }
    }
}
