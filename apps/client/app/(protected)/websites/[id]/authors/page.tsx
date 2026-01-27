import { apiServer } from "@/lib/hooks/server.api";
import { Author } from "@repo/database";
import AuthorsPageClient from "./page.client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AuthorsPage({ params }: PageProps) {
  const { id } = await params;
  const initialData = await apiServer.GET<Author[]>(`/api/websites/${id}/authors`);

  return <AuthorsPageClient websiteId={id} initialData={initialData} />;
}