import prisma from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: websiteId } = await params;
        const domain = await prisma.website.findUnique({
            where: {
                id: websiteId,
            },
            select: {
                domain: true,
            }
        });

        if (domain) {
            return Response.json(domain);
        } else {
            return Response.json({ error: "Domain not found" }, { status: 404 });
        }
    } catch (error) {
        console.error(error);
        return Response.json({ error: "Internal Server Error" }, { status: 500 });
    }
}