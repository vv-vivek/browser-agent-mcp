import { z } from 'zod';
import { BrowserManager } from '../browser.js';

/**
 * CAPTCHA Solving via Third-Party Services
 * 
 * Supported services:
 * - 2Captcha (TWOCAPTCHA_API_KEY)
 * - Anti-Captcha (ANTICAPTCHA_API_KEY)
 * 
 * The user needs to set one of these API keys to use CAPTCHA solving.
 */

const TWOCAPTCHA_API_KEY = process.env.TWOCAPTCHA_API_KEY || '';
const ANTICAPTCHA_API_KEY = process.env.ANTICAPTCHA_API_KEY || '';

interface CaptchaResult {
    success: boolean;
    solution?: string;
    error?: string;
}

// 2Captcha Implementation
async function solveTwoCaptcha(siteKey: string, pageUrl: string): Promise<CaptchaResult> {
    if (!TWOCAPTCHA_API_KEY) {
        return { success: false, error: 'TWOCAPTCHA_API_KEY not set' };
    }

    // Step 1: Submit CAPTCHA
    const submitUrl = `http://2captcha.com/in.php?key=${TWOCAPTCHA_API_KEY}&method=userrecaptcha&googlekey=${siteKey}&pageurl=${encodeURIComponent(pageUrl)}&json=1`;

    const submitResponse = await fetch(submitUrl);
    const submitData = await submitResponse.json();

    if (submitData.status !== 1) {
        return { success: false, error: submitData.request };
    }

    const taskId = submitData.request;

    // Step 2: Poll for result (max 120 seconds)
    for (let i = 0; i < 24; i++) {
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds

        const resultUrl = `http://2captcha.com/res.php?key=${TWOCAPTCHA_API_KEY}&action=get&id=${taskId}&json=1`;
        const resultResponse = await fetch(resultUrl);
        const resultData = await resultResponse.json();

        if (resultData.status === 1) {
            return { success: true, solution: resultData.request };
        }

        if (resultData.request !== 'CAPCHA_NOT_READY') {
            return { success: false, error: resultData.request };
        }
    }

    return { success: false, error: 'Timeout waiting for CAPTCHA solution' };
}

// Anti-Captcha Implementation
async function solveAntiCaptcha(siteKey: string, pageUrl: string): Promise<CaptchaResult> {
    if (!ANTICAPTCHA_API_KEY) {
        return { success: false, error: 'ANTICAPTCHA_API_KEY not set' };
    }

    // Step 1: Create task
    const createTaskResponse = await fetch('https://api.anti-captcha.com/createTask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            clientKey: ANTICAPTCHA_API_KEY,
            task: {
                type: 'RecaptchaV2TaskProxyless',
                websiteURL: pageUrl,
                websiteKey: siteKey,
            },
        }),
    });

    const createData = await createTaskResponse.json();

    if (createData.errorId !== 0) {
        return { success: false, error: createData.errorDescription };
    }

    const taskId = createData.taskId;

    // Step 2: Poll for result
    for (let i = 0; i < 24; i++) {
        await new Promise(resolve => setTimeout(resolve, 5000));

        const resultResponse = await fetch('https://api.anti-captcha.com/getTaskResult', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                clientKey: ANTICAPTCHA_API_KEY,
                taskId: taskId,
            }),
        });

        const resultData = await resultResponse.json();

        if (resultData.status === 'ready') {
            return { success: true, solution: resultData.solution.gRecaptchaResponse };
        }

        if (resultData.errorId !== 0) {
            return { success: false, error: resultData.errorDescription };
        }
    }

    return { success: false, error: 'Timeout waiting for CAPTCHA solution' };
}

export const solveCaptchaTool = {
    name: 'browser_solve_captcha',
    description: 'Solve a reCAPTCHA v2 on the current page using 2Captcha or Anti-Captcha service. Requires TWOCAPTCHA_API_KEY or ANTICAPTCHA_API_KEY environment variable.',
    schema: z.object({
        siteKey: z.string().optional().describe('reCAPTCHA site key (auto-detected if not provided)'),
        service: z.enum(['2captcha', 'anticaptcha', 'auto']).optional().describe('Which service to use (default: auto-detect based on available API key)'),
    }),
    execute: async ({ siteKey, service = 'auto' }: { siteKey?: string; service?: '2captcha' | 'anticaptcha' | 'auto' }) => {
        const page = await BrowserManager.getInstance().getPage();
        const pageUrl = page.url();

        // Auto-detect siteKey if not provided
        let detectedSiteKey = siteKey;
        if (!detectedSiteKey) {
            try {
                detectedSiteKey = await page.evaluate(() => {
                    // Look for reCAPTCHA element
                    const recaptcha = document.querySelector('.g-recaptcha');
                    if (recaptcha) {
                        return recaptcha.getAttribute('data-sitekey') || '';
                    }
                    // Look in iframe src
                    const iframe = document.querySelector('iframe[src*="recaptcha"]');
                    if (iframe) {
                        const src = iframe.getAttribute('src') || '';
                        const match = src.match(/[?&]k=([^&]+)/);
                        return match ? match[1] : '';
                    }
                    return '';
                });
            } catch (e) {
                // Ignore errors
            }
        }

        if (!detectedSiteKey) {
            return {
                content: [{
                    type: 'text' as const,
                    text: 'Could not detect reCAPTCHA site key. Please provide it manually.',
                }],
                isError: true,
            };
        }

        // Determine which service to use
        let result: CaptchaResult;

        if (service === '2captcha' || (service === 'auto' && TWOCAPTCHA_API_KEY)) {
            result = await solveTwoCaptcha(detectedSiteKey, pageUrl);
        } else if (service === 'anticaptcha' || (service === 'auto' && ANTICAPTCHA_API_KEY)) {
            result = await solveAntiCaptcha(detectedSiteKey, pageUrl);
        } else {
            return {
                content: [{
                    type: 'text' as const,
                    text: 'No CAPTCHA service configured. Set TWOCAPTCHA_API_KEY or ANTICAPTCHA_API_KEY environment variable.',
                }],
                isError: true,
            };
        }

        if (!result.success) {
            return {
                content: [{
                    type: 'text' as const,
                    text: `CAPTCHA solving failed: ${result.error}`,
                }],
                isError: true,
            };
        }

        // Inject the solution into the page
        try {
            await page.evaluate((token) => {
                // Set the response in the hidden textarea
                const textarea = document.querySelector('#g-recaptcha-response') as HTMLTextAreaElement;
                if (textarea) {
                    textarea.style.display = 'block';
                    textarea.value = token;
                    textarea.style.display = 'none';
                }

                // Also try to set in all textareas (for multiple reCAPTCHAs)
                document.querySelectorAll('[name="g-recaptcha-response"]').forEach((el) => {
                    (el as HTMLTextAreaElement).value = token;
                });

                // Try to trigger the callback
                if (typeof (window as any).onCaptchaSolved === 'function') {
                    (window as any).onCaptchaSolved(token);
                }
                if (typeof (window as any).grecaptcha !== 'undefined') {
                    try {
                        (window as any).grecaptcha.enterprise?.execute?.() ||
                            (window as any).grecaptcha?.execute?.();
                    } catch (e) {
                        // Ignore
                    }
                }
            }, result.solution!);
        } catch (e) {
            // Solution obtained but injection might have issues
        }

        return {
            content: [{
                type: 'text' as const,
                text: `CAPTCHA solved successfully! Token injected into page. You may need to click the submit button.`,
            }],
        };
    },
};

export const getCaptchaInfoTool = {
    name: 'browser_captcha_info',
    description: 'Detect CAPTCHA types and get info about CAPTCHAs on the current page',
    schema: z.object({}),
    execute: async () => {
        const page = await BrowserManager.getInstance().getPage();

        const captchaInfo = await page.evaluate(() => {
            const info: any = {
                recaptchaV2: false,
                recaptchaV3: false,
                hCaptcha: false,
                siteKey: null,
            };

            // Check for reCAPTCHA v2
            const recaptchaV2 = document.querySelector('.g-recaptcha');
            if (recaptchaV2) {
                info.recaptchaV2 = true;
                info.siteKey = recaptchaV2.getAttribute('data-sitekey');
            }

            // Check for reCAPTCHA v3 / invisible
            const recaptchaScript = document.querySelector('script[src*="recaptcha"]');
            if (recaptchaScript) {
                const src = recaptchaScript.getAttribute('src') || '';
                if (src.includes('render=')) {
                    info.recaptchaV3 = true;
                    const match = src.match(/render=([^&]+)/);
                    if (match) info.siteKey = match[1];
                }
            }

            // Check for hCaptcha
            const hcaptcha = document.querySelector('.h-captcha');
            if (hcaptcha) {
                info.hCaptcha = true;
                info.siteKey = hcaptcha.getAttribute('data-sitekey');
            }

            // Check iframes
            const recaptchaIframe = document.querySelector('iframe[src*="recaptcha"]');
            const hcaptchaIframe = document.querySelector('iframe[src*="hcaptcha"]');

            if (recaptchaIframe) info.recaptchaV2 = true;
            if (hcaptchaIframe) info.hCaptcha = true;

            return info;
        });

        const configured = TWOCAPTCHA_API_KEY ? '2Captcha' : (ANTICAPTCHA_API_KEY ? 'Anti-Captcha' : 'None');

        return {
            content: [{
                type: 'text' as const,
                text: JSON.stringify({
                    ...captchaInfo,
                    configuredService: configured,
                    canSolve: !!(TWOCAPTCHA_API_KEY || ANTICAPTCHA_API_KEY),
                }, null, 2),
            }],
        };
    },
};
