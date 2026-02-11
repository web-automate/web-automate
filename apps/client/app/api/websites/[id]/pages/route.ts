import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const pages = await prisma.staticPage.findMany({
            where: {
                websiteId: id,
            },
        });

        if (!pages) {
            return NextResponse.json(
                { error: "Pages not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(pages);
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { title, slug, content } = await req.json();

        const page = await prisma.staticPage.create({
            data: {
                websiteId: id,
                title,
                content,
                slug
            },
        });

        if (!page) {
            return NextResponse.json(
                { error: "Page not created" },
                { status: 400 }
            );
        }

        return NextResponse.json(page);
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
