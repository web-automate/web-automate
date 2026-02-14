import path from 'path';
import { Page } from 'puppeteer-core';
import { SCRAPER_CONFIG } from '../../lib/scraper.const';
import { SessionMonitorService } from '../session-monitor.service';
import { ScraperCore } from './scraper-core';

export class TextScraper {
  constructor(
    private core: ScraperCore,
    private sessionMonitor: SessionMonitorService
  ) {}

  public async generate(prompt: string): Promise<string> {
    let page: Page;

    try {
      try {
        console.info('[TextScraper] Setting up chat session...');
        page = await this.core.setupChatSession(prompt);
      } catch (error) {
        console.error('[TextScraper] Error in core.setupChatSession:', error);
        throw error;
      }
      
      try {

        await page.screenshot({ path: path.join(process.cwd(), 'debug_voice_btn.png') });
        console.info('[TextScraper] Waiting for generation to complete (Voice Button)...');
        await page.waitForSelector(SCRAPER_CONFIG.VOICE_BTN_SELECTOR, {
          visible: true,
          timeout: 240000
        });
        console.info('[TextScraper] Generation completed (Voice Button detected).');
      } catch (error) {
        console.error('[TextScraper] Timeout/Error waiting for Voice Button (Generation stuck?):', error);
        throw error;
      }

      try {
        console.info('[TextScraper] Waiting for Copy Button to be enabled...');
        await this.waitForCopyButton(page);
      } catch (error) {
        console.error('[TextScraper] Error waiting for Copy Button:', error);
        throw error;
      }

      try {
        const copyButtons = await page.$$(SCRAPER_CONFIG.COPY_BTN_SELECTOR);
        const lastCopyBtn = copyButtons[copyButtons.length - 1];

        if (!lastCopyBtn) {
            throw new Error('Copy button selector found no elements');
        }

        console.info('[TextScraper] Clicking the last Copy Button...');
        await lastCopyBtn.click();
        
        await new Promise(r => setTimeout(r, 2000));
      } catch (error) {
        console.error('[TextScraper] Error finding or clicking Copy Button:', error);
        throw error;
      }

      try {
        console.info('[TextScraper] Reading text via navigator.clipboard...');
        
        const clipboardContent = await page.evaluate(async () => {
          return await navigator.clipboard.readText();
        });

        if (!clipboardContent) {
          throw new Error('Clipboard is empty after reading');
        }

        console.info(`[TextScraper] Successfully extracted text (${clipboardContent.length} chars).`);
        return clipboardContent;

      } catch (error) {
        console.error('[TextScraper] Error reading clipboard contents:', error);
        throw error;
      }

    } catch (error) {
      console.error('[TextScraper] CRITICAL ERROR in generate flow. Triggering session validation.', error);
      try {
        this.sessionMonitor.validateNow();
      } catch (monitorError) {
        console.error('[TextScraper] Failed to execute sessionMonitor.validateNow():', monitorError);
      }
      throw error;
    }
  }

  private async waitForCopyButton(page: Page) {
    try {
      return await page.waitForFunction((selector: string) => {
        const buttons = document.querySelectorAll(selector);
        const lastBtn = buttons[buttons.length - 1] as HTMLButtonElement;
        return lastBtn && !lastBtn.disabled;
      }, { timeout: 30000 }, SCRAPER_CONFIG.COPY_BTN_SELECTOR);
    } catch (error) {
      console.error('[TextScraper] waitForCopyButton timed out or failed:', error);
      throw error;
    }
  }
}