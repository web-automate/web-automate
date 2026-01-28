// app/(protected)/websites/[id]/articles/page.tsx
import { apiServer } from "@/lib/hooks/server.api";
import { Article } from "@repo/database";
import { ArticlesClient } from "./page.client";

export default async function ArticlesPage({ 
  params 
}: { 
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  const initialData = await apiServer.GET<Article[]>(
    `/api/articles?websiteId=${id}`
  );

  return (
    <ArticlesClient 
      websiteId={id} 
      initialData={initialData} 
    />
  );
}