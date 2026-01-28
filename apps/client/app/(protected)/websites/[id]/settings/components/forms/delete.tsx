import { Button, Divider, Stack } from "@mantine/core";

interface DeleteFormProps {
    websiteId: string;
    onDelete: (id: string) => void;
    isPending: boolean;
}

const DeleteForm = ({ websiteId, onDelete, isPending }: DeleteFormProps) => {
    return (
        <Stack>
            <Divider label="Danger Zone" labelPosition="center" color="red" />

            <Button
                variant="outline"
                color="red"
                fullWidth
                onClick={() => onDelete(websiteId)}
                loading={isPending}
            >
                Delete Website
            </Button>
        </Stack>
    );
}

export default DeleteForm;
