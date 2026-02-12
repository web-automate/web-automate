import { r2Client } from "@/lib/helpers/r2";
import prisma from "@/lib/prisma";
import { PutObjectCommand } from "@aws-sdk/client-s3";
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

    let formData;
    try {
      formData = await req.formData();
    } catch (e) {
      console.error("[Webhook Image] Failed to parse FormData:", e);
      return NextResponse.json({ error: "Invalid Form Data" }, { status: 400 });
    }

    const file = formData.get("file");
    const status = formData.get("status") as GenerateStatusType;
    const articleDataString = formData.get("articleData") as string;

    if (status === "generating") {
      return NextResponse.json({ message: "Image generation is in progress" }, { status: 200 });
    }

    if (!file || !(file instanceof File) || status !== "completed" || !articleDataString) {
      console.error("[Webhook Image] Missing or invalid data:", {
        hasFile: !!file,
        isFileSize: file instanceof File ? file.size : 'N/A',
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

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExtension = file.type.split("/")[1] || "png";
    const websiteId = article.website.id; 

    const fileName = `${NODE_ENV}/websites/${websiteId}/articles/${articleId}/featured-${randomUUID()}.${fileExtension}`;

    try {
      await r2Client.send(new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: fileName,
        Body: buffer,
        ContentType: file.type,
      }));
    } catch (s3Error: any) {
      console.error("[Webhook Image] S3 Upload Failed:", s3Error);
      return NextResponse.json({ error: "Storage Upload Failed: " + s3Error.message }, { status: 500 });
    }

    const imagePath = `${process.env.R2_PUBLIC_DOMAIN}/${fileName}`;

    await prisma.article.update({
      where: { id: articleId },
      data: {
        featuredImage: imagePath,
      }
    });

    console.log(`[Webhook Image] Success for Article ${articleId}`);

    return NextResponse.json({
      success: true,
      message: "Image uploaded and embedded successfully",
      imageUrl: imagePath
    });

  } catch (error: any) {
    console.error("[Webhook Image] CRITICAL ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error: " + error.message }, { status: 500 });
  }
}