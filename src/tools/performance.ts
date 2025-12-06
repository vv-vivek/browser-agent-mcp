import { z } from 'zod';
import { BrowserManager } from '../browser.js';

export const getPerformanceTool = {
    name: 'browser_get_performance',
    description: 'Gets performance metrics for the current page including load times and Core Web Vitals.',
    schema: z.object({}),
    execute: async () => {
        const page = await BrowserManager.getInstance().getPage();

        const metrics = await page.evaluate(() => {
            const perf = window.performance;
            const timing = perf.timing;
            const navigation = perf.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

            // Core Web Vitals and load times
            const result: Record<string, any> = {
                // Load timing
                loadTime: timing.loadEventEnd - timing.navigationStart,
                domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
                firstByte: timing.responseStart - timing.navigationStart,
                domInteractive: timing.domInteractive - timing.navigationStart,

                // Resource counts
                resourceCount: perf.getEntriesByType('resource').length,
            };

            // Get Largest Contentful Paint if available
            const lcpEntries = perf.getEntriesByType('largest-contentful-paint');
            if (lcpEntries.length > 0) {
                result.largestContentfulPaint = (lcpEntries[lcpEntries.length - 1] as any).startTime;
            }

            // Get First Input Delay if available
            const fidEntries = perf.getEntriesByType('first-input');
            if (fidEntries.length > 0) {
                result.firstInputDelay = (fidEntries[0] as any).processingStart - (fidEntries[0] as any).startTime;
            }

            // Get Cumulative Layout Shift if available
            const clsEntries = perf.getEntriesByType('layout-shift');
            if (clsEntries.length > 0) {
                result.cumulativeLayoutShift = clsEntries.reduce((sum, entry) => {
                    return sum + ((entry as any).hadRecentInput ? 0 : (entry as any).value);
                }, 0);
            }

            // Transfer sizes
            if (navigation) {
                result.transferSize = navigation.transferSize;
                result.encodedBodySize = navigation.encodedBodySize;
                result.decodedBodySize = navigation.decodedBodySize;
            }

            return result;
        });

        return {
            content: [{
                type: 'text' as const,
                text: JSON.stringify(metrics, null, 2),
            }],
        };
    },
};
