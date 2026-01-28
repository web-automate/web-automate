'use client';

import { notify } from "@/app/components/notifications";
import { useClientApi } from "@/lib/hooks/client.api";
import { Stack } from "@mantine/core";
import { useRouter } from "next/navigation";
import DeleteForm from "./components/forms/delete";

const WebsiteSettingsPageClient = ({ websiteId }: { websiteId: string }) => {
    const api = useClientApi();
    const { push } = useRouter();

    const { mutate, isPending } = api.Mutate(
        `/api/websites/`,
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

    const handleDelete = () => {
        mutate(websiteId);
    };
    return (
        <Stack>
            <DeleteForm 
                websiteId={websiteId} 
                onDelete={handleDelete} 
                isPending={isPending} 
            />
        </Stack>
    );
}

export default WebsiteSettingsPageClient;