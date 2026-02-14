import sharp from 'sharp';

export class ImageHelper {
  
  static async convertToWebP(buffer: Buffer, quality: number = 80): Promise<Buffer> {
    try {
      const webpBuffer = await sharp(buffer)
        .webp({ quality: quality })
        .toBuffer();
      
      return webpBuffer;
    } catch (error) {
      console.error('Error converting to WebP:', error);
      throw error;
    }
  }

  static async compressToSize(buffer: Buffer, maxPacketSizeKB: number = 100): Promise<Buffer> {
    const maxSizeBytes = maxPacketSizeKB * 1024;
    let quality = 90; 

    const image = sharp(buffer);

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

    console.log(`[ImageHelper] Compressed to ${(buffer.length / 1024).toFixed(2)} KB with quality ${quality}`);
    
    return buffer;
  }
}