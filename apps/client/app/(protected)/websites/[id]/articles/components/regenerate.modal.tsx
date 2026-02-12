import { ModularModal } from "@/app/(protected)/components/modal";
import { notify } from "@/app/components/notifications";
import { TONES } from "@/lib/const/tone";
import { useClientApi } from "@/lib/hooks/client.api";
import { Divider, Group, NumberInput, Paper, Select, Stack, Switch, Text } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconPhoto } from "@tabler/icons-react";
import { useState } from "react";

interface RegenerateArticleModalProps {
    opened: boolean;
    onClose: () => void;
    articleId: string;
    websiteId: string;
}

const RegenerateArticleModal = ({
    opened,
    onClose,
    articleId,
    websiteId,

}: RegenerateArticleModalProps) => {
    const [withImage, setWithImage] = useState(false);
    const api = useClientApi();

    const form = useForm({
        initialValues: {
            tone: TONES[0].value,
            ImageCount: 0,
        },
    });

    const { mutate: regenerateMutate, isPending: isRegenerating } = api.Mutate(
        `/api/websites/{id}/articles/{article-id}/regenerate`,
        { method: "POST" },
        {
            onSuccess: () => {
                notify.success("Article regeneration started");
            },
            onError: () => {
                notify.error("Failed to regenerate article");
            },
            invalidateKeys: [['articles', articleId]]
        }
    );

    const handleRegenerate = () => {
        regenerateMutate({
            params: {
                id: websiteId,
                "article-id": articleId
            },
            body: { ...form.values }
        })
        onClose();
    }

    return (
        <ModularModal
            opened={opened}
            onClose={onClose}
            title="Generate AI Article"
            description="Our AI will write a high-quality article based on your topic and keywords."
            submitLabel="Start Generating"
            onSubmit={handleRegenerate}
            isLoading={isRegenerating}
            size="md"
        >
            <Stack gap="md">

                <Group grow align="flex-start">
                    <Select
                        label="Writing Tone"
                        data={TONES}
                        required
                        allowDeselect={false}
                        {...form.getInputProps('tone')}
                    />
                </Group>

                <Divider label="Visual Enhancements" labelPosition="center" />

                <Paper
                    withBorder
                    p="sm"
                    radius="md"
                    style={{
                        borderColor: withImage ? 'var(--mantine-color-blue-filled)' : undefined,
                        transition: 'border-color 0.2s ease'
                    }}
                >
                    <Stack gap="xs">
                        <Group justify="space-between">
                            <Group gap="xs">
                                <IconPhoto size={20} color={withImage ? 'var(--mantine-color-blue-filled)' : 'gray'} />
                                <div>
                                    <Text size="sm" fw={500}>Include AI Generated Images</Text>
                                    <Text size="xs" c="dimmed">AI will create relevant images for each section</Text>
                                </div>
                            </Group>
                            <Switch
                                checked={withImage}
                                onChange={(event) => setWithImage(event.currentTarget.checked)}
                            />
                        </Group>

                        {withImage && (
                            <NumberInput
                                mt="xs"
                                label="Number of Images"
                                description="AI will decide the best placement for these images (Max 5)"
                                min={0}
                                max={5}
                                {...form.getInputProps('imageCount')}
                            />
                        )}
                    </Stack>
                </Paper>
            </Stack>
        </ModularModal>
    )
}

export default RegenerateArticleModal;
