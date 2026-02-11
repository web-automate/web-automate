import sharp from "sharp";

type ProcessedImage = {
  buffer: Buffer;
  extension: string;
  mime: string;
};

type ImageType = "logoSquare" | "logoRectangle" | "favicon" | string;


export async function processImage(
  inputBuffer: Buffer,
  type: ImageType
): Promise<ProcessedImage> {
  const image = sharp(inputBuffer);

  switch (type) {
    case "favicon":
      const faviconBuffer = await image
        .resize(32, 32, {
          fit: "cover",
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .toFormat("png")
        .toBuffer();

      return {
        buffer: faviconBuffer,
        extension: "ico",
        mime: "image/x-icon",
      };

    case "logoSquare":
      const squareBuffer = await image
        .resize(240, 240, {
          fit: "contain",
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .webp({ quality: 85 })
        .toBuffer();

      return {
        buffer: squareBuffer,
        extension: "webp",
        mime: "image/webp",
      };

    case "logoRectangle":
      const rectBuffer = await image
        .resize(700, 150, {
          fit: "contain",
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .webp({ quality: 85 })
        .toBuffer();

      return {
        buffer: rectBuffer,
        extension: "webp",
        mime: "image/webp",
      };

    default:
      const defaultBuffer = await image.webp().toBuffer();
      return {
        buffer: defaultBuffer,
        extension: "webp",
        mime: "image/webp",
      };
  }
}