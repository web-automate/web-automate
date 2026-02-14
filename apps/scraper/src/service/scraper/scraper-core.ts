import * as fs from 'fs';
import * as path from 'path';
import { ElementHandle, Page } from 'puppeteer-core';
import { SCRAPER_CONFIG } from '../../lib/scraper.const';
import { browserService } from '../browser.service';

export class ScraperCore {
  public async setupChatSession(prompt: string, isImageMode = false, localFilePath?: string): Promise<Page> {
    const page = await browserService.getMainPage();

    if (!page.url().includes(SCRAPER_CONFIG.WEB_URL)) {
      await page.goto(SCRAPER_CONFIG.WEB_URL, { waitUntil: 'networkidle2' });
    }

    const newChatBtn = await page.$(SCRAPER_CONFIG.NEW_CHAT_BTN_SELECTOR);
    if (newChatBtn) {
      await newChatBtn.click();
      await new Promise(r => setTimeout(r, 1000));
    } else {
      await page.reload({ waitUntil: 'networkidle2' });
    }

    if (isImageMode) {
      if (SCRAPER_CONFIG.TOOLS_BTN_SELECTOR) {
        await this.clickElement(page, SCRAPER_CONFIG.TOOLS_BTN_SELECTOR);
        await new Promise(r => setTimeout(r, 500));
      }
      if (SCRAPER_CONFIG.IMAGE_BTN_SELECTOR) {
        await this.clickElement(page, SCRAPER_CONFIG.IMAGE_BTN_SELECTOR);
        await new Promise(r => setTimeout(r, 1000));
      }
    }

    const editorSelector = SCRAPER_CONFIG.PROMPT_INPUT_SELECTOR;
    await page.waitForSelector(editorSelector, { timeout: 10000 });
    await page.focus(editorSelector);

    if (localFilePath) {
      await this.handleFileUpload(page, localFilePath);
    }

    await page.locator(editorSelector).fill(prompt);
    await new Promise(r => setTimeout(r, 800));

    await page.waitForSelector(SCRAPER_CONFIG.SEND_BTN_SELECTOR, { timeout: 30000 });
    await page.keyboard.press('Enter');
    
    return page;
  }

  private async handleFileUpload(page: Page, localFilePath: string): Promise<void> {
    const isMac = process.platform === 'darwin';
    const modifier = isMac ? 'Meta' : 'Control';

    try {
      const buffer = fs.readFileSync(localFilePath);
      const base64Image = buffer.toString('base64');
      const ext = path.extname(localFilePath).toLowerCase().replace('.', '');

      let mimeType = 'image/png';
      if (ext === 'jpg' || ext === 'jpeg') mimeType = 'image/jpeg';
      if (ext === 'webp') mimeType = 'image/webp';

      await page.evaluate(async (base64, mime) => {
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: mime });

        await navigator.clipboard.write([
          new ClipboardItem({ [mime]: blob })
        ]);
      }, base64Image, mimeType);

      await page.keyboard.down(modifier);
      await page.keyboard.press('V');
      await page.keyboard.up(modifier);
      await new Promise(r => setTimeout(r, 2000));
    } catch (error) {
      console.error(error);
    }
  }

  public async clickElement(page: Page, selector: string, timeout = 10000): Promise<void> {
    let element: ElementHandle | null = null;

    if (selector.startsWith('//')) {
      try {
        await page.waitForSelector(`xpath/${selector}`, { timeout, visible: true });
        const elements = await page.$$(`xpath/${selector}`);
        element = elements[0];
      } catch (e) {
        throw e;
      }
    } else {
      await page.waitForSelector(selector, { timeout, visible: true });
      element = await page.$(selector);
    }

    if (element) {
      await element.click();
    } else {
      throw new Error(`Element not found: ${selector}`);
    }
  }

  public async checkContentViolation(page: Page): Promise<void> {
    const violationError = await page.evaluate((selector, keywords) => {
      const messages = document.querySelectorAll(selector);
      if (messages.length === 0) return null;

      const lastMessage = messages[messages.length - 1];
      const text = lastMessage.textContent?.toLowerCase() || '';

      const isViolation = keywords.some((k: string) => text.includes(k.toLowerCase()));
      return isViolation ? lastMessage.textContent : null;
    }, SCRAPER_CONFIG.VIOLATION_SELECTOR, SCRAPER_CONFIG.VIOLATION_KEYWORDS);

    if (violationError) {
      throw new Error(`CONTENT_POLICY_VIOLATION: ${violationError}`);
    }
  }

  public async checkGenerateChoice(page: Page): Promise<void> {
    const generateChoice = await page.evaluate(({ selector }: { selector: string }) => {
      const messages = document.querySelectorAll(selector);
      if (messages.length === 0) return null;
      const lastMessage = messages[messages.length - 1];
      const text = lastMessage?.textContent?.toLowerCase() || '';
      const isGenerateChoice = text.includes('which image do you like more?') ||
        text.includes('generate choice');
      return isGenerateChoice ? lastMessage : null;
    }, { selector: SCRAPER_CONFIG.MULTIGEN_SELECTOR });

    if (generateChoice) {
      await page.waitForNetworkIdle({ timeout: 2000 });
      const clicked = await page.evaluate(() => {
        const buttons = document.querySelectorAll('button.btn-secondary');
        for (const button of Array.from(buttons)) {
          const text = button.textContent?.toLowerCase() || '';
          if (text.includes('image 1')) {
            (button as HTMLButtonElement).click();
            return true;
          }
        }
        return false;
      });

      if (!clicked) {
        throw new Error('GENERATE_CHOICE: Failed to click first option');
      }

      await page.waitForNetworkIdle({ timeout: 2000 });
    }
  }
}