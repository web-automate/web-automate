import prisma from "@/lib/prisma";
import { ArticleRequest, SuccessArticleResponse } from "@/lib/types/api";
import { ArticleStatus } from "@repo/database";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; }> }
) {
  try {
    const { id: websiteId } = await params;
    const articles = await prisma.article.findMany({ 
      where: { websiteId },
      include: { seo: true },
    });
    if (!articles) {
        return NextResponse.json({ error: "Articles not found" }, { status: 404 });
    }
    return NextResponse.json(articles);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch articles" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { topic, keywords, category, websiteId, authorId, tone = "professional", imageCount } = body;

    const article = await prisma.article.create({
      data: {
        topic,
        keywords,
        category,
        content: "",
        websiteId,
        authorId,
        status: "INITIAL", 
        publishedAt: new Date(),
      },
      include: { seo: true },
    });

    const payload: ArticleRequest = {
      topic,
      keywords,
      category,
      tone,
      imageCount: imageCount || undefined,
      webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook/scraper/content`,
      articleData: {
        id: article.id,
      },
    }

    console.log("payload: ", payload)

    const scraperResponse = await fetch(`${process.env.SCRAPER_URL}/api/article/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.API_KEY as string,
      },
      body: JSON.stringify(payload),
    });

    const responseScraper: SuccessArticleResponse = await scraperResponse.json();
    console.log("Scraper Response:", responseScraper);

    if (scraperResponse.ok && responseScraper.data.status === "queued") {
      await prisma.article.update({
        where: { id: article.id },
        data: { status: ArticleStatus.QUEUED },
      });
    }

    if (!scraperResponse.ok) {
      console.error("Scraper Error:", scraperResponse.statusText);
      await prisma.article.update({
        where: { id: article.id },
        data: { status: ArticleStatus.FAILED },
      });
    }

    return NextResponse.json(article, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create article" }, { status: 500 });
  }
}