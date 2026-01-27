import prisma from "@/lib/prisma";
import { ArticleWebhookResponse, ImageRequest, ImageWebhookResponse } from "@/lib/types/api";
import { ArticleStatus } from "@repo/database";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  let articleId: string | undefined;

  try {
    const apiKey = req.headers.get("x-api-key");
    if (apiKey !== process.env.API_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: ArticleWebhookResponse = await req.json();
    console.log("Received webhook:", body.topic); 

    let articleData = body.articleData;
    if (typeof articleData === "string") {
      try {
        articleData = JSON.parse(articleData);
      } catch (e) {
        console.error("Failed to parse articleData string:", e);
      }
    }

    articleId = articleData?.id;
    
    if (!articleId) {
      return NextResponse.json({ error: "No Article ID provided" }, { status: 400 });
    }

    const existingArticle = await prisma.article.findUnique({
      where: { id: articleId },
      select: { status: true }
    });

    if (existingArticle?.status === ArticleStatus.WAITING_IMAGE && body.status === "waiting_for_images") {
      console.log(`[Webhook] Idempotency check: Article ${articleId} already waiting for images. Ignoring duplicate.`);
      return NextResponse.json({ 
        success: true, 
        message: "Article already processing images (Idempotent success)", 
        data: { id: articleId } 
      }, { status: 200 });
    }

    const withImages = body.status === "waiting_for_images";
    const isCompleted = body.status === "completed" || withImages;

    if (!isCompleted) {
        await prisma.article.update({
          where: { id: articleId },
          data: { status: ArticleStatus.FAILED }
        });
      return NextResponse.json({
        error: "Invalid scraper response format",
        received: { status: body.status, articleId }
      }, { status: 400 });
    }

    const { title, content } = body;

    const updatedArticle = await prisma.article.update({
      where: { id: articleId },
      data: {
        title: title,
        content: content,
        slug: title?.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''),
        excerpt: content ? content.substring(0, 160).replace(/[#*`]/g, "") + "..." : "",
        status: body.status === "waiting_for_images" ? ArticleStatus.WAITING_IMAGE : ArticleStatus.DRAFT,
        seo: {
          upsert: {
            create: {
              metaTitle: title?.substring(0, 60),
              ogTitle: title?.substring(0, 60),
              metaDescription: content?.substring(0, 155).replace(/[#*`]/g, ""),
            },
            update: {
              metaTitle: title?.substring(0, 60),
              ogTitle: title?.substring(0, 60),
              metaDescription: content?.substring(0, 155).replace(/[#*`]/g, ""),
            }
          }
        }
      },
      include: { seo: true }
    });

    if (body.status === "waiting_for_images") {
      const imagePrompts = Array.isArray(body.properties?.imagePrompts) ? body.properties!.imagePrompts : [];
      
      console.log(`[Webhook] Processing ${imagePrompts.length} image prompts for article ${articleId} (Parallel)`);

      if (imagePrompts.length > 0) {
        const imageRequests = imagePrompts.map(async (imagePrompt) => {
          const dataBody: ImageRequest = {
            prompt: imagePrompt.prompt,
            aspectRatio: "16:9",
            imageMaxSizeKB: 1024,
            tone: imagePrompt.tone,
            webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook/scraper/image`,
            webpFormat: true,
            articleData: {
              id: articleId,
              imageIndex: imagePrompt.index,
            }
          };

          console.log(`[Webhook] Sending image generation request for index ${imagePrompt.index}`);
          
          try {
            const scraperResponse = await fetch(`${process.env.SCRAPER_URL}/api/image/generate`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-api-key": process.env.API_KEY as string,
              },
              body: JSON.stringify(dataBody),
            });

            if (!scraperResponse.ok) {
              const errorText = await scraperResponse.text();
              console.error(`[Webhook] Image scraper failed for index ${imagePrompt.index} (Status: ${scraperResponse.status}): ${errorText}`);
              return; 
            }

            const responseScraper: ImageWebhookResponse = await scraperResponse.json();
            console.log(`[Webhook] Image scraper response for index ${imagePrompt.index}:`, responseScraper);
          } catch (err) {
            console.error(`[Webhook] Network error for index ${imagePrompt.index}:`, err);
          }
        });

        await Promise.all(imageRequests);
      } else {
        console.warn(`[Webhook] No image prompts found in properties`);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Article updated successfully",
      data: { id: updatedArticle.id }
    }, { status: 200 });

  } catch (error: any) {
    console.error("Webhook Update Error:", error);

    if (articleId && error.code !== 'P2025') {
      await prisma.article.update({
        where: { id: articleId },
        data: { status: ArticleStatus.FAILED }
      }).catch(err => console.error("Double Fault: Could not set status to FAILED", err));
    }

    if (error.code === 'P2025') {
      return NextResponse.json({ error: "Article ID not found in database" }, { status: 404 });
    }

    return NextResponse.json({
      error: "Internal Server Error",
      details: error.message
    }, { status: 500 });
  }
}