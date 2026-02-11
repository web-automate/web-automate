'use client';

import { ModularModal } from '@/app/(protected)/components/modal';
import { useClientApi } from '@/lib/hooks/client.api';
import {
    ActionIcon,
    Avatar,
    Box,
    Button,
    Group,
    Menu,
    Paper,
    Stack,
    Text,
    TextInput,
    Textarea
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { Author } from '@repo/database';
import { IconDotsVertical, IconEdit, IconExternalLink, IconPlus, IconTrash } from '@tabler/icons-react';
import Link from 'next/link';
import { useState } from 'react';

interface AuthorsPageClientProps {
    websiteId: string;
    initialData: Author[];
}

export default function AuthorsPageClient({ websiteId, initialData }: AuthorsPageClientProps) {
    const { Mutate } = useClientApi();
    const [opened, setOpened] = useState(false);
    const authors = initialData;

    const { mutate: createMutate, isPending: createIsPending } = Mutate<Author, any>(
        `/api/websites/{websiteId}/authors`,
        { method: 'POST' },
        {
            onSuccess: () => {
                setOpened(false);
                createForm.reset();
            },
            invalidateKeys: [['websites', websiteId, 'authors']]
        }
    );

    const deleteMutation = Mutate<void, string>(
        `/api/websites/{websiteId}/authors/{author-id}`,
        { method: 'DELETE' },
        {
            invalidateKeys: [['websites', websiteId, 'authors']]
        }
    );

    const createForm = useForm({
        initialValues: {
            name: '',
            slug: '',
            bio: '',
        },
        validate: {
            name: (value) => (value.length < 2 ? 'Name too short' : null),
            slug: (value) => (value.length < 2 ? 'Slug too short' : null),
        },
    });

    const handleCreate = (values: typeof createForm.values) => {
        createMutate({
            params: { id: websiteId },
            body: values
        });
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this author?')) {
            deleteMutation.mutate({
                params: {
                    id: websiteId,
                    "author-id": id
                }
            });
        }
    };

    const renderAuthorCard = (author: Author) => (
        <Paper key={author.id} withBorder p="md" radius="md">
            <Group justify="space-between" align="center" wrap="nowrap">
                <Group gap="sm" style={{ flex: 1, minWidth: 0 }}>
                    <Avatar
                        src={author.image}
                        radius="xl"
                        color="blue"
                        size="md"
                    >
                        {author.name.substring(0, 2).toUpperCase()}
                    </Avatar>
                    <Box style={{ flex: 1, minWidth: 0 }}>
                        <Text fz="sm" fw={600} truncate="end">
                            {author.name}
                        </Text>
                        <Text fz="xs" c="dimmed" truncate="end">
                            @{author.slug}
                        </Text>
                    </Box>
                </Group>

                <Group gap={4}>
                    <ActionIcon
                        component={Link}
                        href={`/websites/${websiteId}/authors/${author.id}`}
                        variant="subtle"
                        color="gray"
                        size="md"
                    >
                        <IconEdit size={18} />
                    </ActionIcon>

                    <Menu shadow="md" width={200} position="bottom-end">
                        <Menu.Target>
                            <ActionIcon variant="subtle" color="gray" size="md">
                                <IconDotsVertical size={18} />
                            </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                            <Menu.Item
                                leftSection={<IconExternalLink size={14} />}
                                component="a"
                                href={author.websiteUrl || '#'}
                                target="_blank"
                                disabled={!author.websiteUrl}
                            >
                                Visit Website
                            </Menu.Item>
                            <Menu.Divider />
                            <Menu.Item
                                color="red"
                                leftSection={<IconTrash size={14} />}
                                onClick={() => handleDelete(author.id)}
                            >
                                Delete Author
                            </Menu.Item>
                        </Menu.Dropdown>
                    </Menu>
                </Group>
            </Group>
        </Paper>
    );

    return (
        <Stack gap="lg" p="xs">
            <Stack gap="xs">
                <Button
                    fullWidth
                    leftSection={<IconPlus size={18} />}
                    onClick={() => setOpened(true)}
                    radius="md"
                    mt="xs"
                >
                    Add Author
                </Button>
            </Stack>

            <Stack gap="sm">
                {authors?.length > 0 ? (
                    authors.map(renderAuthorCard)
                ) : (
                    <Paper withBorder p="xl" radius="md" bg="gray.0">
                        <Text ta="center" size="sm" c="dimmed">No authors found.</Text>
                    </Paper>
                )}
            </Stack>

            <ModularModal
                isLoading={createIsPending}
                opened={opened}
                onClose={() => setOpened(false)}
                onSubmit={createForm.onSubmit(handleCreate)}
                title="Add New Author"
            >
                <Stack gap="sm">
                    <TextInput
                        label="Name"
                        placeholder="e.g. John Doe"
                        required
                        {...createForm.getInputProps('name')}
                    />
                    <TextInput
                        label="Slug"
                        placeholder="e.g. john-doe"
                        required
                        {...createForm.getInputProps('slug')}
                    />
                    <Textarea
                        label="Bio"
                        placeholder="Brief description about the author..."
                        minRows={3}
                        {...createForm.getInputProps('bio')}
                    />
                </Stack>
            </ModularModal>
        </Stack>
    );
}