'use client';

import LoaderComponent from "@/app/components/loader";
import { notify } from "@/app/components/notifications";
import { useClientApi } from "@/lib/hooks/client.api";
import {
    ActionIcon,
    Badge,
    Button,
    em,
    Group,
    Paper,
    Stack,
    Table,
    Text,
    TextInput,
    Tooltip
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
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

export function ArticlesClient({
    websiteId,
}: {
    websiteId: string;
}) {
    const api = useClientApi();
    const [opened, { open, close }] = useDisclosure(false);
    const [regenerateOpened, { open: openRegenerate, close: closeRegenerate }] = useDisclosure(false);
    const [selectedArticle, setSelectedArticle] = useState<string | null>(null);
    const isMobile = useMediaQuery(`(max-width: ${em(768)})`);
    const { push } = useRouter();

    const { data: articles, isLoading } = api.Get<Article[]>(
        `/api/websites/${websiteId}/articles`,
        ['articles', websiteId],
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
            deleteMutate({ id: {id: websiteId, "article-id": articleId} });
        }
    }

    const rows = articles?.map((article: Article) => (
        <Table.Tr key={article.id}>
            <Table.Td>
                <Text fw={500} size="xs" lineClamp={1} truncate>{article.id}</Text>
                <Text size="xs" c="dimmed" lineClamp={1}>{article.slug}</Text>
            </Table.Td>
            <Table.Td>
                <Badge
                    color={getStatusBadgeColor(article.status)}
                    variant="light"
                >
                    {article.status}
                </Badge>
            </Table.Td>
            <Table.Td style={{ display: isMobile ? "none" : "table-cell" }}>
                <Text size="xs">{new Date(article.createdAt).toLocaleDateString()}</Text>
            </Table.Td>
            <Table.Td>
                <Group gap={4} justify="flex-end">
                    <Tooltip label="Visit article">
                        <ActionIcon
                            variant="subtle"
                            color="gray"
                            style={{
                                display: article.status !== 'PUBLISHED' ? 'none' : 'flex'
                            }}
                        >
                            <IconExternalLink size={16} />
                        </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Regenerate article">
                        <ActionIcon
                            variant="subtle"
                            color="orange"
                            style={{
                                display: article.status === 'FAILED' ? 'flex' : 'none'
                            }}
                            onClick={() => {
                                setSelectedArticle(article.id);
                                openRegenerate();
                            }}
                        >
                            <IconReload size={16} />
                        </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Edit article">
                        <ActionIcon
                            variant="subtle"
                            color="blue"
                            style={{
                                display: article.status === 'FAILED' || article.status === 'INITIAL' || article.status === 'BUILDING' ? 'none' : 'flex'
                            }}
                            onClick={() => push(`/websites/${websiteId}/articles/${article.id}`)}
                        >
                            <IconSettings size={16} />
                        </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Delete article">
                        <ActionIcon
                            onClick={() => handleDelete(article.id)}
                            variant="subtle"
                            color="red"
                            style={{
                                display: article.status === 'BUILDING' ? 'none' : 'flex'
                            }}
                        >
                            <IconTrash size={16} />
                        </ActionIcon>
                    </Tooltip>
                </Group>
            </Table.Td>
        </Table.Tr>
    ));

    return (
        <Stack gap="md">
            <Group justify="space-between">
                <Group gap={4}>
                    <TextInput
                        placeholder="Search articles"
                        radius="md"
                        w={140}
                    />
                    <Button
                        radius="md"
                        color={"orange.5"}
                        variant="filled"
                    >
                        <IconSearch size={16} />
                    </Button>
                </Group>
                <Button
                    onClick={open}
                    leftSection={<IconPlus size={16} />}
                    radius="md">
                    New
                </Button>
            </Group>

            <Paper withBorder radius="md" p={0} style={{ overflow: 'hidden' }}>
                <Table verticalSpacing="sm" highlightOnHover>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>Article</Table.Th>
                            <Table.Th>Status</Table.Th>
                            <Table.Th>Created At</Table.Th>
                            <Table.Th />
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {isLoading ? (
                            <Table.Tr>
                                <Table.Td colSpan={4}>
                                    <LoaderComponent height="10dvh" />
                                </Table.Td>
                            </Table.Tr>
                        ) : (
                            rows && rows.length > 0 ? rows : (
                                <Table.Tr>
                                    <Table.Td colSpan={4}>
                                        <Text c="dimmed" ta="center" py="xl">No articles found.</Text>
                                    </Table.Td>
                                </Table.Tr>
                            )
                        )}
                    </Table.Tbody>
                </Table>
            </Paper>

            <RegenerateArticleModal
                opened={regenerateOpened}
                onClose={closeRegenerate}
                articleId={selectedArticle}
            />

            <AddArticleModal
                opened={opened}
                onClose={close}
                websiteId={websiteId}
            />
        </Stack>
    );
}