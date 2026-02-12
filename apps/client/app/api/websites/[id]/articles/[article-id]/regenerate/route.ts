import prisma from "@/lib/prisma";
import { ArticleRequest, SuccessArticleResponse } from "@/lib/types/api";
import { NextResponse } from "next/server";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string, "article-id": string }> }) {
    const { id, "article-id": articleId } = await params;
    return NextResponse.json({ message: "Regenerate article", websiteId: id, articleId }, { status: 200 });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string, "article-id": string }> }) {
  try {
    const { id, "article-id": articleId } = await params;
    const body = await req.json();

    const article = await prisma.article.findUnique({
      where: { id: articleId },
    });

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    const payload: ArticleRequest = {
      topic: article.topic,
      keywords: article.keywords,
      category: article.category,
      tone: body.tone || "professional",
      imageCount: body.imageCount || undefined,
      webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook/scraper/content`,
      articleData: {
        id: id,
      },
    }

    const scraperResponse = await fetch(`${process.env.SCRAPER_URL}/api/article/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.API_KEY as string,
      },
      body: JSON.stringify(payload),
    });

    const responseScraper: SuccessArticleResponse = await scraperResponse.json();

    if (scraperResponse.ok && responseScraper.data.status === "queued") {
      await prisma.article.update({
        where: { id: id },
        data: { status: "QUEUED" },
      });
    }

    if (scraperResponse.ok && responseScraper.data.status === "generating") {
      await prisma.article.update({
        where: { id: id },
        data: { status: "BUILDING" },
      });
    }

    if (!scraperResponse.ok) {
      console.error("Scraper Error:", scraperResponse.statusText);
      await prisma.article.update({
        where: { id: id },
        data: { status: "FAILED" },
      });
    }

    return NextResponse.json({ message: "Article regeneration request sent" }, { status: 201 });
  } catch (error) {
        return NextResponse.json({ error: "Failed to parse request body" }, { status: 400 });
  }
}