import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const websites = await prisma.template.findMany({
            orderBy: {
                updatedAt: 'desc'
            }
        });

        return NextResponse.json(websites);
    } catch (error) {
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}