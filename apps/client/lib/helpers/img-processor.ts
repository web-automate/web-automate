import sharp from "sharp";

type ImageType = "logoSquare" | "logoRectangle" | "favicon" | string;

export async function processImage(buffer: Buffer, type: ImageType): Promise<{ buffer: Buffer; extension: string; mime: string }> {
  let transform = sharp(buffer);
  
  transform = transform.rotate();

  switch (type) {
    case "logoSquare":
      transform = transform.resize(120, 120, { 
        fit: "inside", 
        withoutEnlargement: true 
      });
      break;

    case "logoRectangle":
      transform = transform.resize(350, 75, { 
        fit: "inside", 
        withoutEnlargement: true 
      });
      break;

    case "favicon":
      transform = transform.resize(48, 48, { 
        fit: "contain", 
        background: { r: 0, g: 0, b: 0, alpha: 0 } 
      });
      break;
      
    default:
      transform = transform.resize(1200, null, { 
        withoutEnlargement: true 
      });
      break;
  }

  const processedBuffer = await transform
    .png({ 
      quality: 80, 
      compressionLevel: 9,
      palette: true
    })
    .toBuffer();

  return {
    buffer: processedBuffer,
    extension: type === "favicon" ? "ico" : "webp",
    mime: type === "favicon" ? "image/x-icon" : "image/webp"
  };
}