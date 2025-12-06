import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { navigateTool } from './tools/navigate.js';
import { screenshotTool } from './tools/screenshot.js';
import { clickTool } from './tools/click.js';
import { typeTool } from './tools/type.js';
import { getContentTool } from './tools/get_content.js';
// Phase 1: Essential Tools
import { scrollTool } from './tools/scroll.js';
import { waitTool } from './tools/wait.js';
import { backTool, forwardTool, getUrlTool, getTitleTool } from './tools/navigation.js';
// Phase 2: Power Tools
import { hoverTool } from './tools/hover.js';
import { selectTool } from './tools/select.js';
import { checkTool } from './tools/check.js';
import { uploadTool } from './tools/upload.js';
import { evalTool } from './tools/eval.js';
import { getLinksTool, getHtmlTool } from './tools/extract.js';
// Phase 3: AI-Enhanced Tools
import { smartClickTool, smartTypeTool, findElementTool } from './tools/smart.js';
import { summarizeTool, analyzeScreenshotTool } from './tools/analyze.js';
// Phase 4: Session & Auth Tools
import { getCookiesTool, setCookiesTool, clearCookiesTool } from './tools/cookies.js';
import { getStorageTool, setStorageTool, clearStorageTool } from './tools/storage.js';
import { newTabTool, switchTabTool, closeTabTool, listTabsTool } from './tools/tabs.js';
import { savePdfTool } from './tools/export.js';
// Phase 5: Monitoring & Testing Tools
import { startCaptureRequestsTool, getRequestsTool, clearRequestsTool } from './tools/network.js';
import { startConsoleTool, getConsoleTool, clearConsoleTool } from './tools/console.js';
import { getPerformanceTool } from './tools/performance.js';
import { a11yCheckTool } from './tools/a11y.js';
// Phase 6: Advanced Features
import { keyboardTool, keyboardTypeTool } from './tools/keyboard.js';
import { downloadTool, downloadClickTool } from './tools/download.js';
import { mobileTool, viewportTool } from './tools/mobile.js';
import { iframeTool, iframeListTool, iframeClickTool } from './tools/iframe.js';
import { dragTool, dragByOffsetTool } from './tools/drag.js';
import { recordStartTool, recordStopTool } from './tools/record.js';
import { solveCaptchaTool, getCaptchaInfoTool } from './tools/captcha.js';
import { BrowserManager } from './browser.js';

// Create server instance
const server = new McpServer({
    name: 'browser-agent-mcp',
    version: '2.3.0',
});

// Helper to register tools
const registerTool = (tool: any) => {
    server.tool(
        tool.name,
        tool.description,
        tool.schema.shape as any,
        tool.execute as any
    );
};

// Original tools
registerTool(navigateTool);
registerTool(screenshotTool);
registerTool(clickTool);
registerTool(typeTool);
registerTool(getContentTool);

// Phase 1: Essential tools
registerTool(scrollTool);
registerTool(waitTool);
registerTool(backTool);
registerTool(forwardTool);
registerTool(getUrlTool);
registerTool(getTitleTool);

// Phase 2: Power tools
registerTool(hoverTool);
registerTool(selectTool);
registerTool(checkTool);
registerTool(uploadTool);
registerTool(evalTool);
registerTool(getLinksTool);
registerTool(getHtmlTool);

// Phase 3: AI-Enhanced tools
registerTool(smartClickTool);
registerTool(smartTypeTool);
registerTool(findElementTool);
registerTool(summarizeTool);
registerTool(analyzeScreenshotTool);

// Phase 4: Session & Auth tools
registerTool(getCookiesTool);
registerTool(setCookiesTool);
registerTool(clearCookiesTool);
registerTool(getStorageTool);
registerTool(setStorageTool);
registerTool(clearStorageTool);
registerTool(newTabTool);
registerTool(switchTabTool);
registerTool(closeTabTool);
registerTool(listTabsTool);
registerTool(savePdfTool);

// Phase 5: Monitoring & Testing tools
registerTool(startCaptureRequestsTool);
registerTool(getRequestsTool);
registerTool(clearRequestsTool);
registerTool(startConsoleTool);
registerTool(getConsoleTool);
registerTool(clearConsoleTool);
registerTool(getPerformanceTool);
registerTool(a11yCheckTool);

// Phase 6: Advanced Features
registerTool(keyboardTool);
registerTool(keyboardTypeTool);
registerTool(downloadTool);
registerTool(downloadClickTool);
registerTool(mobileTool);
registerTool(viewportTool);
registerTool(iframeTool);
registerTool(iframeListTool);
registerTool(iframeClickTool);
registerTool(dragTool);
registerTool(dragByOffsetTool);
registerTool(recordStartTool);
registerTool(recordStopTool);

// Phase 7: CAPTCHA Solving
registerTool(solveCaptchaTool);
registerTool(getCaptchaInfoTool);

// Graceful shutdown
process.on('SIGINT', async () => {
    await BrowserManager.getInstance().close();
    process.exit(0);
});

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('BrowserAgent MCP Server running on stdio');
}

main().catch((error) => {
    console.error('Server error:', error);
    process.exit(1);
});
