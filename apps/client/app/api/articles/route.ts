import prisma from "@/lib/prisma";
import { ArticleRequest, SuccessArticleResponse } from "@/lib/types/api";
import { ArticleStatus } from "@repo/database";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const websiteId = searchParams.get("websiteId");

    if (!websiteId) {
      return NextResponse.json({ error: "websiteId is required" }, { status: 400 });
    }

    const articles = await prisma.article.findMany({
      where: { websiteId },
      include: { seo: true },
      orderBy: { createdAt: "desc" },
    });

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

    if (scraperResponse.ok && responseScraper.data.status === "generating") {
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