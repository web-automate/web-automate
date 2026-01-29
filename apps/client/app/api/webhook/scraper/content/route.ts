import prisma from "@/lib/prisma";
import { ArticleWebhookResponse } from "@/lib/types/api";
import { ArticleStatus } from "@repo/database";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body: ArticleWebhookResponse = await req.json();
    const { type, articleData, title, content, status } = body;
    const articleId = articleData?.id;

    if (!articleId) {
      return new NextResponse("Article ID is required", { status: 400 });
    }

    if (status === "failed") {
      await prisma.article.update({
        where: { id: articleId },
        data: {
          status: "FAILED"
        }
      });
      return new NextResponse("Failed to generate article", { status: 400 });
    }

    if (status === "queued") {
      await prisma.article.update({
        where: { id: articleId },
        data: {
          status: "QUEUED"
        }
      });
      return new NextResponse("Status updated to QUEUE/BUILDING", { status: 200 });
    }

    if (status === "generating") {
      await prisma.article.update({
        where: { id: articleId },
        data: {
          status: "BUILDING"
        }
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

      const updatedArticle = await prisma.article.update({
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
        },
        include: { seo: true }
      });

      return NextResponse.json(updatedArticle);
    }

    return new NextResponse("Unknown Webhook Type", { status: 400 });

  } catch (error: any) {
    return new NextResponse(error.message || "Internal Server Error", { status: 500 });
  }
}