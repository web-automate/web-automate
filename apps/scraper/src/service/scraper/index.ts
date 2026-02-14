import { SessionMonitorService } from '../session-monitor.service';
import { FileManager } from './file-manager';
import { ImageScraper } from './image-scraper';
import { ScraperCore } from './scraper-core';
import { TextScraper } from './text-scraper';

export class AiScraperService {
  private fileManager: FileManager;
  private core: ScraperCore;
  private sessionMonitor: SessionMonitorService;
  private textScraper: TextScraper;
  private imageScraper: ImageScraper;

  constructor() {
    this.fileManager = new FileManager();
    this.core = new ScraperCore();
    this.sessionMonitor = new SessionMonitorService();
    this.textScraper = new TextScraper(this.core, this.sessionMonitor);
    this.imageScraper = new ImageScraper(this.core, this.fileManager);
  }

  public async generateContent(prompt: string): Promise<string> {
    return this.textScraper.generate(prompt);
  }

  public async generateImage(prompt: string, webpFormat?: boolean, imageMaxSizeKB?: number): Promise<Buffer> {
    return this.imageScraper.generate(prompt, webpFormat, imageMaxSizeKB);
  }

  public async generateEditImage(prompt: string, webpFormat?: boolean, imageMaxSizeKB?: number, localFilePath?: string): Promise<Buffer> {
    return this.imageScraper.generateEdit(prompt, webpFormat, imageMaxSizeKB, localFilePath);
  }
}