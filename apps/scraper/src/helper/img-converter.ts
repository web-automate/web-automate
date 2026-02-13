import sharp from 'sharp';
import fs from 'fs';

export class ImageHelper {
  
  static async convertToWebP(inputPath: string, outputPath: string, quality: number = 80): Promise<string> {
    try {
      await sharp(inputPath)
        .webp({ quality: quality })
        .toFile(outputPath);
      
      return outputPath;
    } catch (error) {
      console.error('Error converting to WebP:', error);
      throw error;
    }
  }

  static async compressToSize(inputPath: string, outputPath: string, maxPacketSizeKB: number): Promise<string> {
    const maxSizeBytes = maxPacketSizeKB * 1024;
    let quality = 90; 
    let buffer: Buffer;

    const image = sharp(inputPath);

    while (quality > 10) { 
      buffer = await image
        .webp({ quality: quality })
        .toBuffer();

      if (buffer.length <= maxSizeBytes) {
        break; 
      }

      const currentSize = buffer.length;
      if (currentSize > maxSizeBytes * 2) {
         quality -= 20;
      } else if (currentSize > maxSizeBytes * 1.5) {
         quality -= 10;
      } else {
         quality -= 5;
      }
    }

    fs.writeFileSync(outputPath, buffer!);
    console.log(`[ImageHelper] Compressed to ${(buffer!.length / 1024).toFixed(2)} KB with quality ${quality}`);
    
    return outputPath;
  }
}