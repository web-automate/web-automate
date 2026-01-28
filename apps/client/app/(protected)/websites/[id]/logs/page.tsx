import LogsClientPage from "./page.client";

const LogsPage = async ({ params }: { params: Promise<{ id: string }> }) => {
    const websiteId = await params.then((params) => params.id);
  return (
      <LogsClientPage websiteId={websiteId} />
  );
};

export default LogsPage;