import WebsiteManageClient from "./page.client";

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function WebsiteManagePage({ params }: PageProps) {
    const { id } = await params;

    return <WebsiteManageClient id={id} />;
}