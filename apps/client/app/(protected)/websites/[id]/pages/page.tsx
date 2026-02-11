import { apiServer } from "@/lib/hooks/server.api";
import { StaticPage } from "@repo/database";
import PagesPageClient from "./page.client";

const pagesPage = async ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;

    const pages : StaticPage[] = await apiServer.GET(
        `/api/websites/${id}/pages`
    );

    return (
        <PagesPageClient websiteId={id} pages={pages} />
    );
}

export default pagesPage;