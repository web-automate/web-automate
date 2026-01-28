import WebsiteSettingsPageClient from "./page.client";

const WebsiteSettingsPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  return (
      <WebsiteSettingsPageClient websiteId={id} />
  );
}

export default WebsiteSettingsPage;
