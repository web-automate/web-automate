import { Page } from 'puppeteer-core'; // Pastikan import Page ada
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
      // 1. Setup Chat Session
      try {
        console.info('[TextScraper] Setting up chat session...');
        page = await this.core.setupChatSession(prompt);
      } catch (error) {
        console.error('[TextScraper] Error in core.setupChatSession:', error);
        throw error;
      }
      
      // 2. Wait for Generation Completion (Voice Button)
      try {
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

      // 3. Wait for Copy Button availability
      try {
        console.info('[TextScraper] Waiting for Copy Button to be enabled...');
        await this.waitForCopyButton(page);
      } catch (error) {
        console.error('[TextScraper] Error waiting for Copy Button:', error);
        throw error;
      }

      // 4. Find and Click Copy Button
      try {
        const copyButtons = await page.$$(SCRAPER_CONFIG.COPY_BTN_SELECTOR);
        const lastCopyBtn = copyButtons[copyButtons.length - 1];

        if (!lastCopyBtn) {
           throw new Error('Copy button selector found no elements');
        }

        console.info('[TextScraper] Clicking the last Copy Button...');
        await lastCopyBtn.click();
        
        // Wait for clipboard write operation
        await new Promise(r => setTimeout(r, 1000));
      } catch (error) {
        console.error('[TextScraper] Error finding or clicking Copy Button:', error);
        throw error;
      }

      // 5. Read from Clipboard
      try {
        console.info('[TextScraper] Reading text from clipboard...');
        const responseText = await page.evaluate(() => navigator.clipboard.readText());

        if (!responseText) {
          throw new Error('Clipboard is empty or access denied');
        }

        console.info(`[TextScraper] Successfully extracted text (${responseText.length} chars).`);
        return responseText;

      } catch (error) {
        console.error('[TextScraper] Error reading clipboard contents:', error);
        throw error;
      }

    } catch (error) {
      // Global Error Handler for Text Generation
      console.error('[TextScraper] CRITICAL ERROR in generate flow. Triggering session validation.', error);
      
      // Bungkus validasi session dalam try-catch juga agar tidak menelan error asli jika validasi gagal
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