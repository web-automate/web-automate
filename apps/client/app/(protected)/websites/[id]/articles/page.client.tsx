'use client';

import LoaderComponent from "@/app/components/loader";
import { notify } from "@/app/components/notifications";
import { useClientApi } from "@/lib/hooks/client.api";
import {
    ActionIcon,
    Badge,
    Box,
    Button,
    Divider,
    Group,
    Paper,
    Stack,
    Text,
    TextInput
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Article } from "@repo/database";
import { IconExternalLink, IconPlus, IconReload, IconSearch, IconSettings, IconTrash } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AddArticleModal } from "./components/article.modal";
import RegenerateArticleModal from "./components/regenerate.modal";

const getStatusBadgeColor = (status: string) => {
    const statusColors = {
        'INITIAL': 'gray',
        'DRAFT': 'blue',
        'PUBLISHED': 'green',
        'ARCHIVED': 'gray',
        'BUILDING': 'orange',
        'FAILED': 'red',
        'WAITING_IMAGE': 'yellow'
    };
    return statusColors[status as keyof typeof statusColors] || 'gray';
};

const getIconStatus = (status: string) => {
    const statusIcons = {
        'INITIAL': IconSettings,
        'DRAFT': IconPlus,
        'PUBLISHED': IconExternalLink,
        'ARCHIVED': IconReload,
        'BUILDING': IconReload,
        'FAILED': IconReload,
        'WAITING_IMAGE': IconReload
    };
    return statusIcons[status as keyof typeof statusIcons] || IconReload;
};

export function ArticlesClient({
    websiteId,
}: {
    websiteId: string;
}) {
    const api = useClientApi();
    const [opened, { open, close }] = useDisclosure(false);
    const [regenerateOpened, { open: openRegenerate, close: closeRegenerate }] = useDisclosure(false);
    const [selectedArticle, setSelectedArticle] = useState<string | null>(null);
    const { push } = useRouter();

    const { data: articles, isLoading } = api.Get<Article[]>(
        `/api/websites/${websiteId}/articles`,
        ['articles', websiteId],
    );

    const { data: domain } = api.Get<{ domain: string }>(
        `/api/websites/${websiteId}/domain`,
        ['domain', websiteId],
    );

    const { mutate: deleteMutate } = api.Mutate(
        `/api/websites/{id}/articles/{article-id}`,
        { method: "DELETE" },
        {
            onSuccess: () => {
                notify.success("Article deleted successfully");
                close();
            },
            onError: () => {
                notify.error("Failed to delete article");
            },
            invalidateKeys: [['articles', websiteId]]
        }
    );

    const handleDelete = (articleId: string) => {
        if (confirm("Are you sure you want to delete this article?")) {
            deleteMutate({
                params: {
                    id: websiteId,
                    "article-id": articleId
                }
            });
        }
    }

    const renderArticleCard = (article: Article) => {
        const StatusIcon = getIconStatus(article.status);

        return (
            <Paper
                key={article.id}
                withBorder
                p="md"
                radius="md"
                shadow="xs"
                style={{ transition: 'transform 0.2s ease' }}
            >
                <Stack gap="sm">
                    <Group justify="space-between" align="flex-start" wrap="nowrap">
                        <Box style={{ flex: 1, minWidth: 0 }}>
                            <Text
                                fw={600}
                                size="sm"
                                truncate="end"
                                onClick={() => push(`/websites/${websiteId}/articles/${article.id}`)}
                                style={{ cursor: 'pointer' }}
                            >
                                {article.id}
                            </Text>
                            <Text size="xs" c="dimmed" truncate="end">
                                {article.slug}
                            </Text>
                        </Box>
                        <Badge
                            color={getStatusBadgeColor(article.status)}
                            variant="light"
                            leftSection={<StatusIcon size={12} />}
                            size="sm"
                        >
                            {article.status}
                        </Badge>
                    </Group>

                    <Divider variant="dashed" />

                    <Group justify="space-between" align="center">
                        <Text size="xs" c="dimmed">
                            {new Date(article.createdAt).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                            })}
                        </Text>

                        <Group gap={8}>
                            <ActionIcon
                                variant="light"
                                color="gray"
                                size="md"
                                onClick={() => window.open(`https://${domain?.domain}/${article.slug}`, '_blank')}
                                style={{ display: article.status !== 'PUBLISHED' ? 'none' : 'flex' }}
                            >
                                <IconExternalLink size={16} />
                            </ActionIcon>

                            <ActionIcon
                                variant="light"
                                color="orange"
                                size="md"
                                style={{ display: article.status === 'FAILED' ? 'flex' : 'none' }}
                                onClick={() => {
                                    setSelectedArticle(article.id);
                                    openRegenerate();
                                }}
                            >
                                <IconReload size={16} />
                            </ActionIcon>

                            <ActionIcon
                                variant="light"
                                color="blue"
                                size="md"
                                onClick={() => push(`/websites/${websiteId}/articles/${article.id}`)}
                                style={{
                                    display: ['FAILED', 'INITIAL', 'BUILDING'].includes(article.status) ? 'none' : 'flex'
                                }}
                            >
                                <IconSettings size={16} />
                            </ActionIcon>

                            <ActionIcon
                                onClick={() => handleDelete(article.id)}
                                variant="light"
                                color="red"
                                size="md"
                                style={{ display: article.status === 'BUILDING' ? 'none' : 'flex' }}
                            >
                                <IconTrash size={16} />
                            </ActionIcon>
                        </Group>
                    </Group>
                </Stack>
            </Paper>
        );
    };

    return (
        <Stack gap="lg" p="xs">
            <Stack gap="sm">
                <TextInput
                    placeholder="Search articles..."
                    radius="md"
                    size="md"
                    leftSection={<IconSearch size={18} stroke={1.5} />}
                />
                <Button
                    onClick={open}
                    fullWidth
                    size="md"
                    leftSection={<IconPlus size={20} />}
                    radius="md"
                >
                    Create New Article
                </Button>
            </Stack>

            <Stack gap="md">
                {isLoading ? (
                    <LoaderComponent height="20dvh" />
                ) : (
                    articles && articles.length > 0 ? (
                        articles.map(renderArticleCard)
                    ) : (
                        <Paper withBorder p="xl" radius="md">
                            <Text c="dimmed" ta="center">No articles found.</Text>
                        </Paper>
                    )
                )}
            </Stack>

            <RegenerateArticleModal
                opened={regenerateOpened}
                onClose={closeRegenerate}
                articleId={selectedArticle!}
                websiteId={websiteId}
            />

            <AddArticleModal
                opened={opened}
                onClose={close}
                websiteId={websiteId}
            />
        </Stack>
    );
}