import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
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