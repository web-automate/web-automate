import * as fs from 'fs';
import * as path from 'path';
import { ElementHandle, Page } from 'puppeteer-core';
import { SCRAPER_CONFIG } from '../../lib/scraper.const';
import { browserService } from '../browser.service';

export class ScraperCore {

  public async setupChatSession(prompt: string, isImageMode = false, localFilePath?: string): Promise<Page> {
    console.info(`[ScraperCore] Starting chat session... Mode: ${isImageMode ? 'Image' : 'Text'}`);
    
    // 1. Get Page
    let page: Page;
    try {
      page = await browserService.getMainPage();
    } catch (error) {
      console.error('[ScraperCore] Error getting main page:', error);
      throw error;
    }

    // 2. Navigation
    try {
      if (!page.url().includes(SCRAPER_CONFIG.WEB_URL)) {
        console.info(`[ScraperCore] Navigating to ${SCRAPER_CONFIG.WEB_URL}`);
        await page.goto(SCRAPER_CONFIG.WEB_URL, { waitUntil: 'networkidle2' });
      }
    } catch (error) {
      console.error('[ScraperCore] Error navigating to URL:', error);
      throw error;
    }

    // 3. Click New Chat
    try {
      const newChatBtn = await page.$(SCRAPER_CONFIG.NEW_CHAT_BTN_SELECTOR);
      if (newChatBtn) {
        console.info('[ScraperCore] Clicking "New Chat" button...');
        await newChatBtn.click();
        await new Promise(r => setTimeout(r, 1000));
      } else {
        console.info('[ScraperCore] "New Chat" button not found, reloading page...');
        await page.reload({ waitUntil: 'networkidle2' });
      }
    } catch (error) {
      console.error('[ScraperCore] Error interacting with New Chat button:', error);
      // Non-blocking error, maybe page is already fresh
    }

    // 4. Image Mode Toggles
    if (isImageMode) {
      try {
        console.info('[ScraperCore] Activating Image Mode...');
        if (SCRAPER_CONFIG.TOOLS_BTN_SELECTOR) {
          await this.clickElement(page, SCRAPER_CONFIG.TOOLS_BTN_SELECTOR);
          await new Promise(r => setTimeout(r, 500));
        }
        if (SCRAPER_CONFIG.IMAGE_BTN_SELECTOR) {
          await this.clickElement(page, SCRAPER_CONFIG.IMAGE_BTN_SELECTOR);
          await new Promise(r => setTimeout(r, 1000));
        }
      } catch (error) {
        console.error('[ScraperCore] Error toggling Image Mode buttons:', error);
        throw error;
      }
    }

    const editorSelector = SCRAPER_CONFIG.PROMPT_INPUT_SELECTOR;

    // 5. Focus Editor
    try {
      console.info(`[ScraperCore] Waiting for input selector: ${editorSelector}`);
      await page.waitForSelector(editorSelector, { timeout: 10000 });
      await page.focus(editorSelector);
    } catch (error) {
      console.error('[ScraperCore] Error focusing on editor input:', error);
      throw error;
    }

    // 6. File Upload
    if (localFilePath) {
      try {
        console.info(`[ScraperCore] Uploading file from: ${localFilePath}`);
        await this.handleFileUpload(page, localFilePath);
      } catch (error) {
        console.error('[ScraperCore] Error during file upload execution:', error);
        throw error;
      }
    }

    // 7. Fill Prompt
    try {
      console.info('[ScraperCore] Filling prompt text...');
      await page.locator(editorSelector).fill(prompt);
      await new Promise(r => setTimeout(r, 800));
    } catch (error) {
      console.error('[ScraperCore] Error filling prompt text:', error);
      throw error;
    }

    // 8. Send Message
    try {
      console.info('[ScraperCore] Sending message...');
      await page.waitForSelector(SCRAPER_CONFIG.SEND_BTN_SELECTOR, { timeout: 30000 });
      await page.keyboard.press('Enter');
      console.info('[ScraperCore] Message sent successfully.');
    } catch (error) {
      console.error('[ScraperCore] Error clicking send or pressing Enter:', error);
      throw error;
    }
    
    return page;
  }

  private async handleFileUpload(page: Page, localFilePath: string): Promise<void> {
    const isMac = process.platform === 'darwin';
    const modifier = isMac ? 'Meta' : 'Control';

    if (!fs.existsSync(localFilePath)) {
      console.error(`[ScraperCore] File not found: ${localFilePath}`);
      return;
    }

    const buffer = fs.readFileSync(localFilePath);
    const base64Image = buffer.toString('base64');
    const ext = path.extname(localFilePath).toLowerCase().replace('.', '');

    let mimeType = 'image/png';
    if (ext === 'jpg' || ext === 'jpeg') mimeType = 'image/jpeg';
    if (ext === 'webp') mimeType = 'image/webp';

    // 1. Inject to Clipboard
    try {
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
    } catch (error) {
      console.error('[ScraperCore] Error injecting image to clipboard via page.evaluate:', error);
      throw error;
    }

    // 2. Paste Action
    try {
      console.info('[ScraperCore] Pasting image from clipboard...');
      await page.keyboard.down(modifier);
      await page.keyboard.press('V');
      await page.keyboard.up(modifier);
      await new Promise(r => setTimeout(r, 2000));
    } catch (error) {
      console.error('[ScraperCore] Error performing keyboard paste shortcut:', error);
      throw error;
    }
  }

  public async clickElement(page: Page, selector: string, timeout = 10000): Promise<void> {
    let element: ElementHandle | null = null;

    try {
      if (selector.startsWith('//')) {
        try {
          await page.waitForSelector(`xpath/${selector}`, { timeout, visible: true });
          const elements = await page.$$(`xpath/${selector}`);
          element = elements[0];
        } catch (xpathError) {
            console.error(`[ScraperCore] Error finding element by XPath: ${selector}`, xpathError);
            throw xpathError;
        }
      } else {
        try {
          await page.waitForSelector(selector, { timeout, visible: true });
          element = await page.$(selector);
        } catch (cssError) {
            console.error(`[ScraperCore] Error finding element by CSS Selector: ${selector}`, cssError);
            throw cssError;
        }
      }

      if (element) {
        try {
          await element.click();
        } catch (clickError) {
          console.error(`[ScraperCore] Error clicking element: ${selector}`, clickError);
          throw clickError;
        }
      } else {
        throw new Error(`Element not found: ${selector}`);
      }
    } catch (error) {
      // Re-throw to be handled by caller
      throw error;
    }
  }

  public async checkContentViolation(page: Page): Promise<void> {
    try {
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
    } catch (error) {
      console.error('[ScraperCore] Error checking content violation:', error);
      throw error;
    }
  }

  public async checkGenerateChoice(page: Page): Promise<void> {
    let generateChoice: Element | null = null;

    // 1. Check existence
    try {
        generateChoice = await page.evaluate(({ selector }: { selector: string }) => {
            const messages = document.querySelectorAll(selector);
            if (messages.length === 0) return null;
            const lastMessage = messages[messages.length - 1];
            const text = lastMessage?.textContent?.toLowerCase() || '';
            const isGenerateChoice = text.includes('which image do you like more?') ||
                                    text.includes('generate choice');
            return isGenerateChoice ? lastMessage : null;
        }, { selector: SCRAPER_CONFIG.MULTIGEN_SELECTOR });
    } catch (error) {
        console.error('[ScraperCore] Error evaluating Generate Choice existence:', error);
        // Don't throw, just return/continue
        return;
    }

    if (generateChoice) {
      console.info('[ScraperCore] "Generate Choice" dialog detected.');
      
      try {
        await page.waitForNetworkIdle({ timeout: 2000 });
      } catch (error) {
         console.error('[ScraperCore] Error waiting for network idle (Choice):', error);
      }

      // 2. Click Option
      try {
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
      } catch (error) {
          console.error('[ScraperCore] Error clicking "Image 1" button:', error);
          throw error;
      }

      try {
        await page.waitForNetworkIdle({ timeout: 2000 });
      } catch (error) {
        console.error('[ScraperCore] Error waiting for network idle after click:', error);
      }
    }
  }
}