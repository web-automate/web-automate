import { apiServer } from "@/lib/hooks/server.api";
import { Article } from "@repo/database";
import { ArticleDetailClient } from "./page.client";

export default async function ArticleDetailPage({ 
    params 
}: { 
    params: Promise<{ id: string; 'article-id': string }> 
}) {
    const { id, 'article-id': articleId } = await params;

    const article : Article = await apiServer.GET(
        `/api/websites/${id}/articles/${articleId}`
    );

    return (
        <ArticleDetailClient 
            article={article}
        />
    );
}