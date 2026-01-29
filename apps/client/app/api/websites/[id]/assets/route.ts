import { auth } from "@/lib/auth";
import { processImage } from "@/lib/helpers/img-processor";
import { r2Client } from "@/lib/helpers/r2";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { prisma } from "@repo/database";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        const { id } = await params;

        const user = session?.user;

        if (!user) return new NextResponse("Unauthorized", { status: 401 });

        const formData = await req.formData();
        const file = formData.get("file") as File;
        const type = formData.get("type") as string;

        if (!file || !type) {
            return new NextResponse("Missing file or type", { status: 400 });
        }

        const website = await prisma.website.findUnique({
            where: { id, ownerId: user.id },
        });

        if (!website) {
            return new NextResponse("Website not found or access denied", { status: 404 });
        }

        const rawBytes = await file.arrayBuffer();
        const rawBuffer = Buffer.from(rawBytes);

        const { buffer, extension, mime } = await processImage(rawBuffer, type);

        const fileName = `${type}.${extension}`;

        const env = process.env.NODE_ENV || "development";
        const key = `${env}/websites/${id}/static/${fileName}`;

        const command = new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME || "automate",
            Key: key,
            Body: buffer,
            ContentType: mime,
        });

        await r2Client.send(command);

        const publicUrl = `${process.env.R2_PUBLIC_DOMAIN}/${key}?v=${Date.now()}`;

        const updatedWebsite = await prisma.website.update({
            where: { id },
            data: {
                [type]: publicUrl,
            },
        });

        return NextResponse.json(updatedWebsite);

    } catch (error) {
        console.error("[R2_UPLOAD_ERROR]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}