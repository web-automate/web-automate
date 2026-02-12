import prisma from "@/lib/prisma";
import { ArticleWebhookResponse, ImageRequest } from "@/lib/types/api";
import { ArticleStatus } from "@repo/database";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body: ArticleWebhookResponse = await req.json();
    const { articleData, title, content, status, properties, topic } = body as any; 
    const articleId = articleData?.id;

    if (!articleId) {
      return new NextResponse("Article ID is required", { status: 400 });
    }

    if (status === "failed") {
      await prisma.article.update({
        where: { id: articleId },
        data: { status: "FAILED" }
      });
      return new NextResponse("Failed to generate article", { status: 400 });
    }

    if (status === "queued") {
      await prisma.article.update({
        where: { id: articleId },
        data: { status: "QUEUED" }
      });
      return new NextResponse("Status updated to QUEUE/BUILDING", { status: 200 });
    }

    if (status === "generating") {
      await prisma.article.update({
        where: { id: articleId },
        data: { status: "BUILDING" }
      });
      return new NextResponse("Status updated to GENERATING", { status: 200 });
    }

    if (status === "waiting_for_images" || status === "completed") {
      const finalStatus: ArticleStatus = status === "waiting_for_images"
        ? "WAITING_IMAGE"
        : "DRAFT";

      const cleanContent = content || "";
      const cleanTitle = title || "Untitled Article";

      const slug = cleanTitle
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '');

      const excerpt = cleanContent
        .substring(0, 160)
        .replace(/[#*`_]/g, "")
        .trim() + "...";

      const metaDescription = cleanContent
        .substring(0, 155)
        .replace(/[#*`_]/g, "")
        .trim();

      await prisma.article.update({
        where: { id: articleId },
        data: {
          title: cleanTitle,
          content: cleanContent,
          slug: slug,
          excerpt: excerpt,
          status: finalStatus,
          seo: {
            upsert: {
              create: {
                metaTitle: cleanTitle.substring(0, 60),
                ogTitle: cleanTitle.substring(0, 60),
                metaDescription: metaDescription,
                ogType: "article"
              },
              update: {
                metaTitle: cleanTitle.substring(0, 60),
                ogTitle: cleanTitle.substring(0, 60),
                metaDescription: metaDescription,
              }
            }
          }
        }
      });

      if (status === "waiting_for_images") {
        if (properties?.imageCount) {
          console.log(`[Webhook Content] Processing ${properties.imageCount} images for article ${articleId}`);
          
          for (let i = 0; i < properties.imageCount; i++) {
            try {
              let rawPrompt = properties.imagePrompts?.[i]?.prompt;
              
              if (!rawPrompt || rawPrompt.length < 5) {
                 console.warn(`[Webhook Content] Prompt missing for image ${i}. Using fallback.`);
                 rawPrompt = `Illustration for article topic: ${title || topic || "General abstract image"}. High quality, professional style, 4k.`;
              }

              const payload: ImageRequest = {
                prompt: rawPrompt,
                articleData: {
                  id: articleData.id,
                  imageIndex: properties.imagePrompts?.[i]?.index || (i + 1), // Pastikan index tidak 0 jika logic Anda butuh 1-based
                },
                aspectRatio: "16:9",
                tone: properties.imagePrompts?.[i]?.tone || "artSchool",
                imageMaxSizeKB: 300,
                webpFormat: true,
                webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook/scraper/image`
              }

              const scraperResponse = await fetch(`${process.env.SCRAPER_URL}/api/image/generate`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "x-api-key": process.env.API_KEY as string,
                },
                body: JSON.stringify(payload),
              });

              if (!scraperResponse.ok) {
                const errorText = await scraperResponse.text();
                throw new Error(`${scraperResponse.status} ${scraperResponse.statusText} - ${errorText}`);
              }

              const imageData = await scraperResponse.json();
              console.log(`Image ${i} generated successfully:`, imageData);

            } catch (error) {
              console.error(`Error generating image ${i}:`, error);
              await prisma.article.update({
                where: { id: articleId },
                data: { status: "FAILED" } 
              });
              
              return new NextResponse(`Failed to generate image ${i}: ${(error as Error).message}`, { status: 500 });
            }
          }
        }
      }

      return NextResponse.json({ success: true });
    }

    return new NextResponse("Unknown Webhook Type", { status: 400 });

  } catch (error: any) {
    console.error("[Webhook Content] Critical Error:", error);
    return new NextResponse(error.message || "Internal Server Error", { status: 500 });
  }
}