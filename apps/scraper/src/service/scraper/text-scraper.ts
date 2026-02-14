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
        
        // Give browser time to write to internal clipboard
        await new Promise(r => setTimeout(r, 1000));
      } catch (error) {
        console.error('[TextScraper] Error finding or clicking Copy Button:', error);
        throw error;
      }

      // 5. Read from Clipboard (Using Paste Workaround)
      try {
        console.info('[TextScraper] Reading text via Paste workaround...');
        
        // --- FIX STARTS HERE ---
        // Instead of navigator.clipboard.readText(), we paste into a dummy element
        const responseText = await page.evaluate(async () => {
          // 1. Create a textarea
          const textarea = document.createElement('textarea');
          document.body.appendChild(textarea);
          textarea.value = '';
          textarea.select();
          textarea.focus();
          
          // 2. Return the element validation for the node script to proceed
          return true;
        });

        // 3. Perform Paste (Ctrl+V / Cmd+V)
        const modifier = process.platform === 'darwin' ? 'Meta' : 'Control';
        await page.keyboard.down(modifier);
        await page.keyboard.press('V');
        await page.keyboard.up(modifier);

        // 4. Read value and cleanup
        const pastedContent = await page.evaluate(() => {
          const textarea = document.querySelector('textarea');
          const content = textarea?.value || '';
          textarea?.remove();
          return content;
        });
        // --- FIX ENDS HERE ---

        if (!pastedContent) {
          throw new Error('Clipboard is empty or access denied (Paste yielded empty string)');
        }

        console.info(`[TextScraper] Successfully extracted text (${pastedContent.length} chars).`);
        return pastedContent;

      } catch (error) {
        console.error('[TextScraper] Error reading clipboard contents:', error);
        throw error;
      }

    } catch (error) {
      // Global Error Handler for Text Generation
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