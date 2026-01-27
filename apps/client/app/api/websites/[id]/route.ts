import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "ID Website diperlukan" },
        { status: 400 }
      );
    }

    const website = await prisma.website.findUnique({
      where: {
        id: id,
      },
      include: {
        template: true,
        owner: true,
      },
    });

    if (!website) {
      return NextResponse.json(
        { error: "Website tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(website);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}