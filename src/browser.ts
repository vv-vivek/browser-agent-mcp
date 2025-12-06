import { chromium, Browser, Page, BrowserContext } from 'playwright';

export class BrowserManager {
    private static instance: BrowserManager;
    private browser: Browser | null = null;
    private context: BrowserContext | null = null;
    private pages: Map<string, Page> = new Map();
    private activeTabId: string = 'main';
    private tabCounter: number = 0;

    private constructor() { }

    public static getInstance(): BrowserManager {
        if (!BrowserManager.instance) {
            BrowserManager.instance = new BrowserManager();
        }
        return BrowserManager.instance;
    }

    public async getPage(): Promise<Page> {
        if (!this.browser) {
            this.browser = await chromium.launch({ headless: false });
        }
        if (!this.context) {
            this.context = await this.browser.newContext();
        }

        let page = this.pages.get(this.activeTabId);
        if (!page) {
            page = await this.context.newPage();
            this.pages.set(this.activeTabId, page);
        }
        return page;
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

