import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import createWebsiteSchema from "@/lib/schema/website";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import z from "zod";

export async function GET() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const websites = await prisma.website.findMany({
            where: {
                ownerId: session.user.id
            },
            include: {
                template: true, 
            },
            orderBy: {
                updatedAt: 'desc'
            }
        });

        return NextResponse.json(websites);
    } catch (error) {
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const validation = createWebsiteSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(z.treeifyError(validation.error), { status: 400 });
    }

    const { name, domain, templateId } = validation.data;

    const existingSite = await prisma.website.findUnique({
      where: { domain },
    });

    if (existingSite) {
      return new NextResponse("Domain already exists", { status: 409 });
    }

    const website = await prisma.website.create({
      data: {
        name,
        domain,
        templateId, 
        ownerId: session.user.id,
      },
    });

    return NextResponse.json(website);
  } catch (error) {
    console.error("[WEBSITES_POST]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}