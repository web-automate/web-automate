import { apiServer } from "@/lib/hooks/server.api";
import { WebsiteSeo } from "@repo/database";
import SEOPageClient from "./page.client";

const SEOPage = async ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;

    const data = await apiServer.GET(`/api/websites/${id}/seos`);

    return <SEOPageClient id={id} seo={data as WebsiteSeo} />
}

export default SEOPage;