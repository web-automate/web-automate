import prisma from "@/lib/prisma";
import { Prisma } from "@repo/database";
import { NextResponse } from "next/server";
import { ArticleUpdateInput } from "../../../../../../../../packages/database/generated/prisma/models";

export async function GET(
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const article = await prisma.article.findUnique({
      where: { id },
      include: { seo: true, website: true },
    });

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    return NextResponse.json(article);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch article" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body: ArticleUpdateInput = await req.json();
    const { seo, ...articleData }: { seo?: Prisma.ArticleSeoUpdateOneWithoutArticleNestedInput } = body;
    const { id } = await params;

    const updatedArticle = await prisma.article.update({
      where: { id },
      data: {
        ...articleData,
        seo: seo ? {
          upsert: {
            create: seo,
            update: seo,
          },
        } : undefined,
      },
      include: { seo: true },
    });

    return NextResponse.json(updatedArticle);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update article" }, { status: 500 });
  }
}

export async function DELETE(
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.article.delete({
      where: { id },
    });
    return NextResponse.json({ message: "Article deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete article" }, { status: 500 });
  }
}