import prisma from "@/lib/prisma";
import { WebsiteStatus } from "@repo/database";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const apiKey = req.headers.get("x-api-key");
    if (apiKey !== process.env.API_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { websiteId, success, message, details } = await req.json();

    if (success) {
      await prisma.website.delete({
        where: { id: websiteId }
      });

      return NextResponse.json({ message: "Website record deleted from database" });
    } else {
      await prisma.$transaction([
        prisma.website.update({
          where: { id: websiteId },
          data: { status: WebsiteStatus.FAILED }
        }),
        prisma.websiteLog.create({
          data: {
            websiteId,
            status: WebsiteStatus.FAILED,
            message: message,
            details: details
          }
        })
      ]);

      return NextResponse.json({ message: "Delete failed, log recorded" });
    }
  } catch (error: any) {
    console.error("[WEBHOOK-DELETE-ERROR]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}