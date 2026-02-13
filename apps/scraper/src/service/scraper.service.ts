import { randomUUID } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { ElementHandle, Page } from 'puppeteer-core';
import { v4 as uuidv4 } from 'uuid';
import { ImageHelper } from '../helper/img-converter';
import { SCRAPER_CONFIG } from '../lib/scraper.const';
import { browserService, TEMP_DOWNLOAD_DIR } from './browser.service';

export class AiScraperService {
  private readonly repoRoot: string;
  private readonly finalDir: string;
  private readonly editImageDir: string;

  constructor() {
    this.repoRoot = process.cwd();

    this.finalDir = path.join(this.repoRoot, 'content', 'images');

    this.editImageDir = path.join(this.finalDir, 'edit');

    if (!fs.existsSync(TEMP_DOWNLOAD_DIR)) {
      fs.mkdirSync(TEMP_DOWNLOAD_DIR, { recursive: true });
    }

    if (!fs.existsSync(this.finalDir)) {
      fs.mkdirSync(this.finalDir, { recursive: true });
    }

    if (!fs.existsSync(this.editImageDir)) {
      fs.mkdirSync(this.editImageDir, { recursive: true });
    }
  }

  public async generateContent(prompt: string): Promise<string> {
    console.log('[AiScraper] Starting content generation task...');

    try {
      const page = await this.setupChatSession(prompt);
      console.log('[AiScraper] Waiting for response generation...');
      await page.waitForSelector(SCRAPER_CONFIG.VOICE_BTN_SELECTOR, {
        visible: true,
        timeout: 180000
      });

      // Instead of relying on the Clipboard API (which often fails in
      // headless/background contexts), read the last assistant message
      // directly from the DOM.
      console.log('[AiScraper] Response ready. Extracting text from DOM...');

      // Reuse VIOLATION_SELECTOR as the generic assistant-message selector.
      const responseText = await page.evaluate((selector: string) => {
        const messages = document.querySelectorAll(selector);
        if (!messages.length) return '';

        const lastMessage = messages[messages.length - 1] as HTMLElement | null;
        if (!lastMessage) return '';

        return lastMessage.innerText || lastMessage.textContent || '';
      }, SCRAPER_CONFIG.VIOLATION_SELECTOR);

      if (!responseText) {
        throw new Error('Failed to extract response text from page');
      }

      console.log('[AiScraper] Content retrieved successfully.');
      return responseText;

    } catch (error) {
      console.error("[AiScraper] Text generation failed:", error);
      throw error;
    }
  }

  public async generateImage(prompt: string, webpFormat?: boolean, imageMaxSizeKB?: number): Promise<string> {
    console.log('[AiScraper] Starting IMAGE generation task...');

    if (!fs.existsSync(this.finalDir)) fs.mkdirSync(this.finalDir, { recursive: true });

    try {
      const page = await this.setupChatSession(prompt, true);

      console.log('[AiScraper] Waiting for image generation...');

      const imageBuffer = await this.downloadImageFromSrc(page);
      const outputPath = path.join(TEMP_DOWNLOAD_DIR, `${randomUUID()}.png`);

      if (imageBuffer) {
        require('fs').writeFileSync(outputPath, imageBuffer);
      }

      const finalFilePath = await this.handleDownloadedFile(outputPath, this.finalDir, imageMaxSizeKB, webpFormat);

      const relativePath = path.relative(this.repoRoot, finalFilePath);
      console.log(`[AiScraper] Image saved: ${relativePath}`);
      return relativePath;
    } catch (error) {
      console.error("[AiScraper] Image generation failed:", error);
      throw error;
    }
  }

  public async generateEditImage(prompt: string, webpFormat?: boolean, imageMaxSizeKB?: number, localFilePath?: string): Promise<string> {
    console.log('[AiScraper] Starting IMAGE EDIT generation task...');

    if (!fs.existsSync(this.editImageDir)) fs.mkdirSync(this.editImageDir, { recursive: true });

    try {
      const page = await this.setupChatSession(prompt, true, localFilePath);
      console.log('[AiScraper] Waiting for image edit generation...');

      const imageBuffer = await this.downloadImageFromSrc(page);
      const outputPath = path.join(TEMP_DOWNLOAD_DIR, `${randomUUID()}.png`);

      if (imageBuffer) {
        require('fs').writeFileSync(outputPath, imageBuffer);
      }

      const finalFilePath = await this.handleDownloadedFile(outputPath, this.editImageDir, imageMaxSizeKB, webpFormat);

      const relativePath = path.relative(this.repoRoot, finalFilePath);
      console.log(`[AiScraper] Image edit saved: ${relativePath}`);
      return relativePath;
    } catch (error) {
      console.error("[AiScraper] Image edit generation failed:", error);
      throw error;
    } finally {
      if (localFilePath) {
        fs.unlinkSync(localFilePath);
        console.log(`[AiScraper] Cleaned up source file: ${localFilePath}`);
      }
    }
  }


  private async setupChatSession(prompt: string, isImageMode = false, localFilePath?: string): Promise<Page> {
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

    // Keep the image flow as-is for now (it may rely on Clipboard for images),
    // but avoid Clipboard API entirely for plain-text prompts, which is what
    // causes the NotAllowedError in headless/background runs.
    if (localFilePath) {
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
    
    await page.locator(editorSelector).fill(prompt);
    await new Promise(r => setTimeout(r, 800));

    await page.waitForSelector(SCRAPER_CONFIG.SEND_BTN_SELECTOR, { timeout: 30000 });

    await page.keyboard.press('Enter');
    return page;
  }

  private async checkContentViolation(page: Page): Promise<void> {
    console.warn('[AiScraper] Timeout waiting for result. Checking for violations...');

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

  private async waitForCopyButton(page: Page) {
    return page.waitForFunction((selector: any) => {
      const buttons = document.querySelectorAll(selector);
      const lastBtn = buttons[buttons.length - 1] as HTMLButtonElement;
      return lastBtn && !lastBtn.disabled;
    }, { timeout: 30000 }, SCRAPER_CONFIG.COPY_BTN_SELECTOR);
  }

  private async handleDownloadedFile(
    sourceFilePath: string,
    destDir: string,
    imageMaxSizeKB?: number,
    webpFormat?: boolean
  ): Promise<string> {
    try {
      if (!fs.existsSync(sourceFilePath)) {
        throw new Error(`Source file not found: ${sourceFilePath}`);
      }

      const newName = `image-${uuidv4()}.webp`;
      let finalPath = path.join(destDir, newName);

      if (imageMaxSizeKB) {
        console.log(`[Process] Compressing to <${imageMaxSizeKB}KB...`);
        await ImageHelper.compressToSize(sourceFilePath, finalPath, imageMaxSizeKB);
        fs.unlinkSync(sourceFilePath);
      } else if (webpFormat) {
        console.log(`[Process] Converting to WebP...`);
        await ImageHelper.convertToWebP(sourceFilePath, finalPath);
        fs.unlinkSync(sourceFilePath);
      } else {
        const ext = path.extname(sourceFilePath);
        finalPath = path.join(destDir, `image-${uuidv4()}${ext}`);
        console.log(`[Process] Moving file to ${finalPath}...`);
        fs.renameSync(sourceFilePath, finalPath);
      }

      console.log(`[Success] Saved to "${finalPath}"`);
      return finalPath;
    } catch (err) {
      console.error('Failed to process image:', err);
      throw err;
    }
  }

  private async clickElement(page: Page, selector: string, timeout = 10000) {
    let element: ElementHandle | null = null;
    console.log(`[AiScraper] Waiting for selector: ${selector}`);

    if (selector.startsWith('//')) {
      try {
        await page.waitForSelector(`xpath/${selector}`, { timeout, visible: true });
        const elements = await page.$$(`xpath/${selector}`);
        element = elements[0];
      } catch (e) {
        console.warn("XPath wait failed, trying evaluation match...");
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

  private async waitForDownloadButtonWithRetry(page: Page, timeoutMs: number): Promise<void> {
    try {
      await page.waitForSelector(SCRAPER_CONFIG.DOWNLOAD_BTN_SELECTOR, {
        visible: true,
        timeout: timeoutMs
      });
    } catch (timeoutError) {
      await this.checkContentViolation(page);

      console.log('[AiScraper] Download button not found, attempting page reload...');
      await page.reload({ waitUntil: 'networkidle2' });

      try {
        await page.waitForSelector(SCRAPER_CONFIG.DOWNLOAD_BTN_SELECTOR, {
          visible: true,
          timeout: 30000
        });
      } catch (retryError) {
        console.error('[AiScraper] Download button still not found after reload.');
        throw new Error('DOWNLOAD_BUTTON_NOT_FOUND_AFTER_RELOAD');
      }
    }

    console.log('[AiScraper] Image generated. Starting download...');

    await new Promise(r => setTimeout(r, 2000));
    await this.clickElement(page, SCRAPER_CONFIG.DOWNLOAD_BTN_SELECTOR);
  }

  private async downloadImageFromSrc(page: Page): Promise<Buffer> {
    const imgSelector = 'img[alt="Generated image"]';

    await page.waitForFunction(
      () => {
        const spans = Array.from(document.querySelectorAll('span'));
        return spans.some(span => span.textContent?.includes('Image created'));
      },
      { timeout: 240000 }
    );

    await this.checkContentViolation(page);

    await this.checkGenerateChoice(page);

    await new Promise(r => setTimeout(r, 3000));

    await page.waitForSelector(imgSelector, { visible: true, timeout: 60000 });

    const imageSrc = await page.$eval(imgSelector, (el) => (el as HTMLImageElement).src);

    const imageBufferData = await page.evaluate(async (url) => {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Fetch failed: ${response.statusText}`);
      const arrayBuffer = await response.arrayBuffer();
      return Array.from(new Uint8Array(arrayBuffer));
    }, imageSrc);

    return Buffer.from(imageBufferData);
  }

  private async checkGenerateChoice(page: Page): Promise<void> {
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
      console.log('[ChatGPT] Found generate choice');
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