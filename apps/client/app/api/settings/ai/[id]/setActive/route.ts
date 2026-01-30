import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    try {
        const result = await prisma.$transaction(async (tx) => {
            await tx.aiConfiguration.updateMany({
                where: { isActive: true },
                data: { isActive: false },
            });

            const updated = await tx.aiConfiguration.update({
                where: { id },
                data: { isActive: true },
            });

            return updated;
        });

        return NextResponse.json({
            success: true,
            message: `Configuration for ${result.provider} updated successfully`,
            data: {
                provider: result.provider,
                isActive: result.isActive
            }
        });

    } catch (error: any) {
        console.error("AI Config Error:", error);
        return NextResponse.json({
            error: "Internal Server Error",
            message: error.message
        }, { status: 500 });
    }
}