'use client';

import { ModularModal } from "@/app/(protected)/components/modal";
import { notify } from "@/app/components/notifications";
import { useClientApi } from "@/lib/hooks/client.api";
import { ArticleRequest } from "@/lib/types/api";
import {
    ActionIcon,
    Divider,
    Group,
    NumberInput,
    Paper,
    Select,
    Skeleton,
    Stack,
    Switch,
    TagsInput,
    Text,
    TextInput,
    Tooltip
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { Author } from "@repo/database";
import { IconPencil, IconPhoto, IconSparkles, IconTags, IconUser } from "@tabler/icons-react";
import { useState } from "react";

interface AddArticleModalProps {
    opened: boolean;
    onClose: () => void;
    websiteId: string;
}

interface ArticleModalFormValues extends Omit<ArticleRequest, 'keywords'> {
    keywords: string[];
    websiteId: string;
    authorId: string;
}

export function AddArticleModal({ opened, onClose, websiteId }: AddArticleModalProps) {
    const api = useClientApi();

    const [withImage, setWithImage] = useState(false);
    const [isAiLoading, setIsAiLoading] = useState(false);

    const { data: authors, isLoading: isLoadingAuthors } = api.Get<Author[]>(
        `/api/websites/${websiteId}/authors?websiteId=${websiteId}`,
        ['authors', websiteId]
    );

    const form = useForm<ArticleModalFormValues>({
        initialValues: {
            topic: '',
            keywords: [],
            category: '',
            authorId: '',
            tone: 'professional',
            websiteId: websiteId,
            imageCount: undefined,
        },
        validate: {
            topic: (value) => (value.length < 10 ? 'Topic must have at least 10 characters' : null),
            category: (value) => (!value ? 'Category is required' : null),
            authorId: (value) => (!value ? 'Please select an author' : null),
            keywords: (value) => (value.length === 0 ? 'Add at least one keyword' : null),
            imageCount: (value, values) => (withImage && value !== undefined && (value < 1 || value > 5) ? 'Max 5 images' : null),
        },
    });

    const { mutate, isPending } = api.Mutate(
        "/api/articles",
        { method: "POST" },
        {
            onSuccess: () => {
                notify.success("Article created successfully");
                form.reset();
                onClose();
            },
            onError: () => {
                notify.error("Failed to create article");
            },
            invalidateKeys: [['articles', websiteId]]
        }
    );

    const handleSubmit = (values: ArticleModalFormValues) => {
        const payload = {
            ...values,
            imageCount: withImage ? values.imageCount : 0
        };
        mutate(payload);
    };

    const handleAiGenerate = async (type: 'topic' | 'keywords') => {
        const context = form.values.topic;
        if (!context && type === 'keywords') return;

        setIsAiLoading(true);
        try {
            const res = await fetch('/api/ai/generate', {
                method: 'POST',
                body: JSON.stringify({ type, context: context || 'trending tech topics' })
            });
            const data = await res.json();

            if (type === 'topic') form.setFieldValue('topic', data.result);
            if (type === 'keywords') form.setFieldValue('keywords', data.result);
        } catch (error) {
            console.error("AI Generation failed", error);
        } finally {
            setIsAiLoading(false);
        }
    };

    const TONES = [
        { value: 'professional', label: 'Professional' },
        { value: 'directResponse', label: 'Direct Response' },
        { value: 'educational', label: 'Educational' },
        { value: 'genZ', label: 'Gen Z / Modern' },
        { value: 'journalist', label: 'Journalist' },
        { value: 'mythBuster', label: 'Myth Buster' },
        { value: 'visionary', label: 'Visionary' },
    ];

    return (
        <ModularModal
            opened={opened}
            onClose={onClose}
            title="Generate AI Article"
            description="Our AI will write a high-quality article based on your topic and keywords."
            submitLabel="Start Generating"
            onSubmit={form.onSubmit(handleSubmit)}
            isLoading={isPending}
            size="md"
        >
            <Stack gap="md">
                <Stack gap="sm">
                    <TextInput
                        label="Article Topic"
                        placeholder="e.g. Pola Pikir Generasi Z"
                        leftSection={<IconPencil size={16} />}
                        required
                        {...form.getInputProps('topic')}
                        rightSection={
                            <Tooltip label="Improve with AI">
                                <ActionIcon
                                    variant="subtle"
                                    color="grape"
                                    loading={isAiLoading}
                                    onClick={() => handleAiGenerate('topic')}
                                >
                                    <IconSparkles size={16} />
                                </ActionIcon>
                            </Tooltip>
                        }
                    />

                    <TagsInput
                        label="Keywords"
                        placeholder="Type and press enter"
                        leftSection={<IconTags size={16} />}
                        required
                        {...form.getInputProps('keywords')}
                        rightSection={
                            <Tooltip label="Generate Keywords with AI">
                                <ActionIcon 
                                    variant="subtle" 
                                    color="grape" 
                                    loading={isAiLoading}
                                    disabled={!form.values.topic}
                                    onClick={() => handleAiGenerate('keywords')}
                                >
                                    <IconSparkles size={16} />
                                </ActionIcon>
                            </Tooltip>
                        }
                    />
                </Stack>

                <Group grow align="flex-start">
                    <TextInput
                        label="Category"
                        placeholder="e.g. Technology"
                        required
                        {...form.getInputProps('category')}
                    />
                    <Select
                        label="Writing Tone"
                        data={TONES}
                        required
                        allowDeselect={false}
                        {...form.getInputProps('tone')}
                    />
                </Group>

                <Select
                    label="Assign Author"
                    placeholder={isLoadingAuthors ? "Loading authors..." : "Select author"}
                    leftSection={<IconUser size={16} />}
                    required
                    disabled={isLoadingAuthors}
                    data={authors?.map(author => ({
                        value: author.id,
                        label: author.name
                    })) || []}
                    {...form.getInputProps('authorId')}
                    rightSection={isLoadingAuthors ? <Skeleton circle height={16} /> : null}
                />

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
                                min={1}
                                max={5}
                                {...form.getInputProps('imageCount')}
                            />
                        )}
                    </Stack>
                </Paper>
            </Stack>
        </ModularModal>
    );
}