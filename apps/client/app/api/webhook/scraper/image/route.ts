import prisma from "@/lib/prisma";
import { ImageWebhookResponse } from "@/lib/types/api";
import { ArticleStatus } from "@repo/database";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const apiKey = req.headers.get("x-api-key");
    if (apiKey !== process.env.API_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: ImageWebhookResponse = await req.json();
    const { imagePath, articleData, status } = body;
    const articleId = articleData?.id;
    const imageIndex = articleData?.imageIndex;

    if (!articleId || status !== "completed" || !imagePath) {
      return NextResponse.json({ error: "Missing data or status not completed" }, { status: 400 });
    }

    const article = await prisma.article.findUnique({
      where: { id: articleId },
      select: { content: true }
    });

    if (!article || !article.content) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    if (article.content.includes(imagePath)) {
      console.log(`[Webhook Image] Duplicate request detected for Article ${articleId} Index ${imageIndex}. Image already embedded.`);
      return NextResponse.json({ 
        success: true, 
        message: "Image already embedded (Idempotent)" 
      });
    }

    let updatedContent = article.content;
    const placeholderRegex = imageIndex !== undefined 
                            ? new RegExp(`\\[image_location_${imageIndex}\\]`)
                            : /\[image_location_\d+\]/; // Fallback any placeholder
    
    const match = updatedContent.match(placeholderRegex);

    if (match) {
      const markdownImage = `\n\n![Article Image ${imageIndex || ''}](${imagePath})\n\n`;
      updatedContent = updatedContent.replace(match[0], markdownImage);
    } else {
      console.warn(`No placeholder found for article ${articleId} index ${imageIndex}, appending to end.`);
      updatedContent += `\n\n![Article Image](${imagePath})`;
    }

    const hasRemainingPlaceholders = /\[image_location_\d+\]/.test(updatedContent);
    const newStatus = hasRemainingPlaceholders ? ArticleStatus.WAITING_IMAGE : ArticleStatus.DRAFT;

    console.log(`[Webhook Image] Article ${articleId} status updated to ${newStatus} (${hasRemainingPlaceholders ? 'waiting' : 'draft'})`);

    await prisma.article.update({
      where: { id: articleId },
      data: {
        content: updatedContent,
        status: newStatus
      }
    });

    return NextResponse.json({ 
        success: true, 
        message: "Image embedded successfully",
        currentStatus: newStatus
    });

  } catch (error: any) {
    console.error("Image Webhook Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}