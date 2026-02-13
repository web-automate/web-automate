import { r2Client } from "@/lib/helpers/r2";
import prisma from "@/lib/prisma";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { ArticleStatus } from "@repo/database";
import { GenerateStatusType } from "@repo/types";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

const NODE_ENV = process.env.NODE_ENV;

export async function POST(req: Request) {
  try {
    if (!NODE_ENV || !process.env.R2_PUBLIC_DOMAIN || !process.env.R2_BUCKET_NAME) {
      console.error("[Webhook Image] Missing Environment Variables");
      return NextResponse.json({ error: "Server Configuration Error" }, { status: 500 });
    }

    const apiKey = req.headers.get("x-api-key");
    if (apiKey !== process.env.API_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contentType = req.headers.get("content-type") || "";

    // Handle JSON payloads (e.g. status updates without a file attached)
    if (!contentType.startsWith("multipart/form-data")) {
      try {
        const jsonBody = await req.json();
        const status = jsonBody?.status as GenerateStatusType | undefined;

        if (status === "generating") {
          return NextResponse.json({ message: "Image generation is in progress" }, { status: 200 });
        }

        // For non-multipart requests that aren't simple status pings, just acknowledge.
        return NextResponse.json({ message: "Ignored non-multipart webhook payload" }, { status: 200 });
      } catch (e) {
        console.error("[Webhook Image] Failed to parse JSON payload for non-multipart request:", e);
        return NextResponse.json({ error: "Invalid non-multipart payload" }, { status: 400 });
      }
    }

    let formData: FormData;
    try {
      formData = await req.formData();
    } catch (e) {
      console.error("[Webhook Image] Failed to parse FormData:", e);
      return NextResponse.json({ error: "Invalid Form Data" }, { status: 400 });
    }

    const fileEntry = formData.get("file");
    const status = formData.get("status") as GenerateStatusType;
    const articleDataString = formData.get("articleData") as string;

    if (status === "generating") {
      return NextResponse.json({ message: "Image generation is in progress" }, { status: 200 });
    }

    const file = fileEntry as unknown as Blob | null;

    // Only proceed when we have a real file (Blob), completed status, and article data.
    if (!file || typeof file.arrayBuffer !== "function" || status !== "completed" || !articleDataString) {
      console.error("[Webhook Image] Missing or invalid data:", {
        hasFile: !!file,
        isFileSize: (file as any)?.size ?? "N/A",
        status,
        hasArticleData: !!articleDataString
      });
      return NextResponse.json({ error: "Missing data or status not completed" }, { status: 400 });
    }

    let articleData;
    try {
      articleData = JSON.parse(articleDataString);
    } catch (e) {
      return NextResponse.json({ error: "Invalid JSON in articleData" }, { status: 400 });
    }

    const articleId = articleData?.id;
    const imageIndex = articleData?.imageIndex;

    if (!articleId) {
      return NextResponse.json({ error: "Missing article ID" }, { status: 400 });
    }

    const article = await prisma.article.findUnique({
      where: { id: articleId },
      select: {
        content: true,
        website: true
      }
    });

    if (!article || !article.content) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    if (!article.website) {
      console.error(`[Webhook Image] Article ${articleId} has no associated website.`);
      return NextResponse.json({ error: "Article has no associated website" }, { status: 404 });
    }

    const placeholderRegex = imageIndex !== undefined
      ? new RegExp(`\\[image_location_${imageIndex}\\]`)
      : /\[image_location_\d+\]/;

    const match = article.content.match(placeholderRegex);

    if (!match) {
      console.warn(`[Webhook Image] Placeholder not found for article ${articleId}`);
      return NextResponse.json({
        success: true,
        message: "Placeholder not found or image already embedded (Idempotent)"
      });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExtension = (file as any).type?.split("/")[1] || "png";
    const websiteId = article.website.id; 

    const fileName = `${NODE_ENV}/websites/${websiteId}/articles/${articleId}/${randomUUID()}.${fileExtension}`;

    try {
      await r2Client.send(new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: fileName,
        Body: buffer,
        ContentType: (file as any).type,
      }));
    } catch (s3Error: any) {
      console.error("[Webhook Image] S3 Upload Failed:", s3Error);
      return NextResponse.json({ error: "Storage Upload Failed: " + s3Error.message }, { status: 500 });
    }

    const imagePath = `${process.env.R2_PUBLIC_DOMAIN}/${fileName}`;

    let updatedContent = article.content;
    const markdownImage = `\n\n![Article Image ${imageIndex || ''}](${imagePath})\n\n`;
    updatedContent = updatedContent.replace(match[0], markdownImage);

    const hasRemainingPlaceholders = /\[image_location_\d+\]/.test(updatedContent);
    const newStatus = hasRemainingPlaceholders ? ArticleStatus.WAITING_IMAGE : ArticleStatus.DRAFT;

    await prisma.article.update({
      where: { id: articleId },
      data: {
        content: updatedContent,
        status: newStatus
      }
    });

    console.log(`[Webhook Image] Success for Article ${articleId}`);

    return NextResponse.json({
      success: true,
      message: "Image uploaded and embedded successfully",
      currentStatus: newStatus,
      imageUrl: imagePath
    });

  } catch (error: any) {
    console.error("[Webhook Image] CRITICAL ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error: " + error.message }, { status: 500 });
  }
}