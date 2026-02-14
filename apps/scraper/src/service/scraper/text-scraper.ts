import { SCRAPER_CONFIG } from '../../lib/scraper.const';
import { ScraperCore } from './scraper-core';

export class TextScraper {
  constructor(private core: ScraperCore) {}

  public async generate(prompt: string): Promise<string> {
    try {
      const page = await this.core.setupChatSession(prompt);
      
      await page.waitForSelector(SCRAPER_CONFIG.VOICE_BTN_SELECTOR, {
        visible: true,
        timeout: 180000
      });

      await this.waitForCopyButton(page);

      const copyButtons = await page.$$(SCRAPER_CONFIG.COPY_BTN_SELECTOR);
      const lastCopyBtn = copyButtons[copyButtons.length - 1];

      if (!lastCopyBtn) throw new Error('Copy button not found');

      await lastCopyBtn.click();
      await new Promise(r => setTimeout(r, 1000));

      const responseText = await page.evaluate(() => navigator.clipboard.readText());

      if (!responseText) {
        throw new Error('Failed to extract response text from page');
      }

      return responseText;
    } catch (error) {
      throw error;
    }
  }

  private async waitForCopyButton(page: any) {
    return page.waitForFunction((selector: any) => {
      const buttons = document.querySelectorAll(selector);
      const lastBtn = buttons[buttons.length - 1] as HTMLButtonElement;
      return lastBtn && !lastBtn.disabled;
    }, { timeout: 30000 }, SCRAPER_CONFIG.COPY_BTN_SELECTOR);
  }
}