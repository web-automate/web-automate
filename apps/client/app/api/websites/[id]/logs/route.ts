import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const websiteId = await params.then((params) => params.id);

    if (!websiteId) {
      return NextResponse.json(
        { error: "Website ID is required" },
        { status: 400 }
      );
    }

    const logs = await prisma.websiteLog.findMany({
      where: {
        websiteId: websiteId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50, 
    });

    return NextResponse.json(logs);
  } catch (error: any) {
    console.error("Fetch Logs Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch website logs", details: error.message },
      { status: 500 }
    );
  }
}