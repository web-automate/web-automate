import { prisma } from "@repo/database";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { websiteId, status, message, details } = await req.json();

    await prisma.$transaction([
      prisma.websiteLog.create({
        data: {
          websiteId,
          status, 
          message,
          details,
        },
      }),

      prisma.website.update({
        where: { id: websiteId },
        data: { 
          status: status === 'SUCCESS' ? 'PUBLISHED' : 
                  status === 'FAILED' ? 'FAILED' : 'BUILDING' 
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to process build log" }, { status: 500 });
  }
}