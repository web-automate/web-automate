import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ImageHelper } from '../../helper/img-converter';
import { TEMP_DOWNLOAD_DIR } from '../browser.service';

export class FileManager {
  private readonly repoRoot: string;
  private readonly finalDir: string;
  private readonly editImageDir: string;

  constructor() {
    this.repoRoot = process.cwd();
    this.finalDir = path.join(this.repoRoot, 'content', 'images');
    this.editImageDir = path.join(this.finalDir, 'edit');
    this.initDirectories();
  }

  private initDirectories(): void {
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

  public getFinalDir(): string {
    return this.finalDir;
  }

  public getEditImageDir(): string {
    return this.editImageDir;
  }

  public getRepoRoot(): string {
    return this.repoRoot;
  }

  public async processDownloadedFile(
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
        await ImageHelper.compressToSize(sourceFilePath, finalPath, imageMaxSizeKB);
        fs.unlinkSync(sourceFilePath);
      } else if (webpFormat) {
        await ImageHelper.convertToWebP(sourceFilePath, finalPath);
        fs.unlinkSync(sourceFilePath);
      } else {
        const ext = path.extname(sourceFilePath);
        finalPath = path.join(destDir, `image-${uuidv4()}${ext}`);
        fs.renameSync(sourceFilePath, finalPath);
      }

      return finalPath;
    } catch (err) {
      throw err;
    }
  }

  public saveBufferToTemp(buffer: Buffer): string {
    const outputPath = path.join(TEMP_DOWNLOAD_DIR, `${uuidv4()}.png`);
    fs.writeFileSync(outputPath, buffer);
    return outputPath;
  }

  public cleanFile(filePath: string): void {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}