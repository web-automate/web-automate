'use client';

import { notify } from "@/app/components/notifications";
import { useClientApi } from "@/lib/hooks/client.api";
import { Stack } from "@mantine/core";
import { Website, WebsiteStatus } from "@repo/database";
import { useRouter } from "next/navigation";
import DeleteForm from "./components/forms/delete";
import { StatusWebsiteForm } from "./components/forms/status";

const WebsiteSettingsPageClient = ({ websiteId }: { websiteId: string }) => {
    const api = useClientApi();
    const { push } = useRouter();

    const { data: website } = api.Get<Website>(
        `/api/websites/${websiteId}`,
        ['websites', websiteId],
      );

    const { mutate, isPending } = api.Mutate(
        `/api/websites/{id}`,
        { method: "DELETE" },
        {
            onSuccess: () => {
                notify.success("Website deleted");
                push(`/websites`);
            },
            onError: () => {
                notify.error("Failed to delete website");
            },
            invalidateKeys: [['websites', websiteId]]
        }
    );

    const { mutate: mutateStatus } = api.Mutate(
        `/api/websites/{id}`,
        { method: "PATCH" },
        {
            onSuccess: () => {
                notify.success("Website status updated");
            },
            onError: () => {
                notify.error("Failed to update website status");
            },
            invalidateKeys: [['websites', websiteId]]
        }
    );

    const handleDelete = () => {
        mutate({
            id: websiteId,
        });
    };

    const handleStatusChange = (status: WebsiteStatus) => {
        mutateStatus({
            id: websiteId,
            body: {
                status,
            },
        });
    };

    console.log(website?.status);
    return (
        <Stack>
            <StatusWebsiteForm 
                websiteId={websiteId} 
                onStatusChange={handleStatusChange} 
                isPending={isPending} 
                currentStatus={website?.status}
            />
            <DeleteForm 
                websiteId={websiteId} 
                onDelete={handleDelete} 
                isPending={isPending} 
            />
        </Stack>
    );
}

export default WebsiteSettingsPageClient;