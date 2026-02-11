import prisma from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        if (!id) {
            return Response.json({ error: "Website ID is required" }, { status: 400 });
        }

        const seo = await prisma.websiteSeo.findMany({
            where: {
                websiteId: id
            },
        });

        return Response.json({ ...seo[0] });
    } catch (error) {
        console.error("[ERROR]", error);
        return Response.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        if (!id) {
            return Response.json({ error: "Website ID is required" }, { status: 400 });
        }

        const body = await req.json();

        const seo = await prisma.websiteSeo.update({
            where: {
                websiteId: id
            },
            data: {
                title: body.title,
                author: body.author,
                canonicalUrl: body.canonicalUrl,
                description: body.description,
                keywords: body.keywords,
                robots: body.robots,
                twitterCard: body.twitterCard,
                twitterDescription: body.twitterDescription,
                twitterHandle: body.twitterHandle,
                twitterImage: body.twitterImage,
                twitterTitle: body.twitterTitle,
                ogDescription: body.ogDescription,
                ogImage: body.ogImage,
                ogTitle: body.ogTitle,
                ogUrl: body.ogUrl,
                ogType: body.ogType,
            },
        });

        return Response.json({ ...seo });
    } catch (error) {
        console.error("[ERROR]", error);
        return Response.json({ error: "Internal server error" }, { status: 500 });
    }
}
