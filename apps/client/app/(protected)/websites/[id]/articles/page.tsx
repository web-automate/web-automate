import { ArticlesClient } from "./page.client";

export default async function ArticlesPage({ 
  params 
}: { 
  params: Promise<{ id: string }>
}) {
  const { id } = await params;

  return (
    <ArticlesClient 
      websiteId={id} 
    />
  );
}