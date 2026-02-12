import { ImageRequest } from "@/lib/types/api";
import { prisma } from "@repo/database";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string, "article-id": string }> }) {
    try {
        const { id, "article-id": articleId } = await params;

        if (!id || !articleId) {
            return new Response(JSON.stringify({ error: "Invalid request" }), { status: 400 });
        }

        const body = await _req.json();

        const articleData = await prisma.article.findUnique({
            where: {
                id: articleId,
            },
        });

        if (!articleData) {
            return new Response(JSON.stringify({ error: "Article not found" }), { status: 404 });
        }

        const payload: ImageRequest = {
            prompt: body.prompt,
            articleData: {
                id: articleId,
            },
            aspectRatio: "16:9",
            tone: body.tone || "realisticPhoto",
            imageMaxSizeKB: 300,
            webpFormat: true,
            webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook/scraper/image/featured`
        }

        const scraperResponse = await fetch(`${process.env.SCRAPER_URL}/api/image/generate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": process.env.API_KEY as string,
            },
            body: JSON.stringify(payload),
        });

        if (!scraperResponse.ok) {
            const errorText = await scraperResponse.text();
            return new Response(JSON.stringify({ error: `${scraperResponse.status} ${scraperResponse.statusText} - ${errorText}` }), { status: scraperResponse.status });
        }

        return new Response(JSON.stringify({ message: "Image generation request sent" }), { status: 200 });
    } catch (error) {
        console.error("Error:", error);
        return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
    }

}