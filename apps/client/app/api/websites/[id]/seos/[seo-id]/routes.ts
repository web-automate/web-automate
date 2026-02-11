import prisma from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string, "seo-id": string }> }) {
    try {
        const { id, "seo-id": seoId } = await params;

        if (!id) {
            return Response.json({ error: "Website ID is required" }, { status: 400 });
        }

        if (!seoId) {
            return Response.json({ error: "SEO ID is required" }, { status: 400 });
        }

        const seo = await prisma.websiteSeo.findUnique({
            where: {
                id: seoId,
                websiteId: id
            },
        });

        console.log("seo", seo);

        return Response.json({ ...seo });
    } catch (error) {
        console.error("[ERROR]", error);
        return Response.json({ error: "Internal server error" }, { status: 500 });
    }
}
