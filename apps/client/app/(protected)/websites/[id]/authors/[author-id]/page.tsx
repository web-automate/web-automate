import { apiServer } from "@/lib/hooks/server.api";
import { Author } from "@repo/database";
import AuthorDetailPageClient from "./page.client";

interface PageProps {
  params: Promise<{ id: string; "author-id": string }>;
}

export default async function AuthorDetailPage({ params }: PageProps) {
  const { id, "author-id": authorId } = await params;

  let authorData: Author | null = null;
  try {
    authorData = await apiServer.GET(`/api/websites/${id}/authors/${authorId}`);
  } catch (error) {
    console.error("Failed to fetch author detail", error);
  }

  return (
    <AuthorDetailPageClient 
      websiteId={id} 
      authorId={authorId} 
      initialData={authorData} 
    />
  );
}