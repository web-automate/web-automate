import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const body = await req.json();

    try {
        const result = await prisma.$transaction(async (tx) => {
            const updated = await tx.aiConfiguration.update({
                where: { id },
                data: body,
            });

            return updated;
        });

        return NextResponse.json({
            success: true,
            message: `Configuration for ${result.provider} updated successfully`,
        });

    } catch (error: any) {
        console.error("AI Config Error:", error);
        return NextResponse.json({
            error: "Internal Server Error",
            message: error.message
        }, { status: 500 });
    }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    try {
        const result = await prisma.$transaction(async (tx) => {
            const deleted = await tx.aiConfiguration.delete({
                where: { id },
            });

            return deleted;
        });

        return NextResponse.json({
            success: true,
            message: `Configuration for ${result.provider} deleted successfully`,
        });

    } catch (error: any) {
        console.error("AI Config Error:", error);
        return NextResponse.json({
            error: "Internal Server Error",
            message: error.message
        }, { status: 500 });
    }
}