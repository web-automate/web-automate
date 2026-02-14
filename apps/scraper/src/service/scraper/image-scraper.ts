import { Page } from 'puppeteer-core';
import { SCRAPER_CONFIG } from '../../lib/scraper.const';
import { FileManager } from './file-manager';
import { ScraperCore } from './scraper-core';

export class ImageScraper {
  constructor(
    private core: ScraperCore,
    private fileManager: FileManager
  ) { }

  public async generate(prompt: string, webpFormat?: boolean, imageMaxSizeKB?: number): Promise<Buffer> {
    let retryCount = 0;
    const maxRetries = 3;

    for (retryCount = 0; retryCount < maxRetries; retryCount++) {
      try {
        const page = await this.core.setupChatSession(prompt, true);
        const imageBuffer = await this.downloadImage(page);

        return imageBuffer;

      } catch (error) {
        if (retryCount === maxRetries - 1) {
          throw error;
        }
      }
    }

    throw new Error("Failed to generate image");
  }

  public async generateEdit(prompt: string, webpFormat?: boolean, imageMaxSizeKB?: number, localFilePath?: string): Promise<Buffer> {
    try {
      const page = await this.core.setupChatSession(prompt, true, localFilePath);
      const imageBuffer = await this.downloadImage(page);

      return imageBuffer;
    } catch (error) {
      throw error;
    } finally {
      if (localFilePath) {
        this.fileManager.cleanFile(localFilePath);
      }
    }
  }

  private async downloadImage(page: Page): Promise<Buffer> {
    const imgSelector = 'img[alt="Generated image"]';

    await page.waitForFunction(
      () => {
        const spans = Array.from(document.querySelectorAll('span'));
        return spans.some(span => span.textContent?.includes('Image created'));
      },
      { timeout: 240000 }
    );

    await page.waitForSelector(SCRAPER_CONFIG.DOWNLOAD_BTN_SELECTOR, { visible: true, timeout: 240000 });

    await this.core.checkContentViolation(page);
    await this.core.checkGenerateChoice(page);

    try {
      await page.waitForSelector(imgSelector, { visible: true, timeout: 60000 });
    } catch (error) {
      throw new Error('IMAGE_NOT_FOUND: Image element not found after waiting');
    }

    const imageSrc = await page.$eval(imgSelector, (el) => (el as HTMLImageElement).src);

    const imageBufferData = await page.evaluate(async (url) => {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Fetch failed: ${response.statusText}`);
      const arrayBuffer = await response.arrayBuffer();
      return Array.from(new Uint8Array(arrayBuffer));
    }, imageSrc);

    return Buffer.from(imageBufferData);
  }
}