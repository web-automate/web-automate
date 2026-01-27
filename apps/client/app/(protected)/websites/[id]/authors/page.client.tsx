'use client';

import { ModularModal } from '@/app/(protected)/components/modal';
import { useClientApi } from '@/lib/hooks/client.api';
import {
    ActionIcon,
    Avatar, // 1. Tambahkan Import Avatar
    Button, Group,
    Menu,
    Paper,
    Stack,
    Table,
    Text,
    TextInput, Textarea,
    Title
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { Author } from '@repo/database';
import { IconDotsVertical, IconEdit, IconExternalLink, IconPlus, IconTrash } from '@tabler/icons-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface AuthorsPageClientProps {
    websiteId: string;
    initialData: Author[];
}

export default function AuthorsPageClient({ websiteId, initialData }: AuthorsPageClientProps) {
    const router = useRouter();
    const { Get, Mutate } = useClientApi();
    const [opened, setOpened] = useState(false);
    const authors = initialData;

    const { mutate: createMutate, isPending: createIsPending } = Mutate<Author, any>(
        `/api/websites/${websiteId}/authors`,
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
        `/api/authors`,
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
        createMutate(values);
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this author?')) {
            deleteMutation.mutate(id);
        }
    };

    const rows = authors?.map((author: Author) => (
        <Table.Tr key={author.id}>
            <Table.Td>
                <Group gap="sm">
                    <Avatar
                        src={author.image}
                        name={author.name}
                        alt={author.name}
                        radius="xl"
                        color="blue"
                    />
                    <Text fz="sm" fw={500}>
                        {author.name}
                    </Text>
                </Group>
            </Table.Td>

            <Table.Td>
                <Text fz="sm" c="dimmed">
                    {author.slug}
                </Text>
            </Table.Td>

            <Table.Td>
                <Group gap={0} justify="flex-end">
                    <ActionIcon component={Link} href={`/websites/${websiteId}/authors/${author.id}`} variant="subtle" color="gray">
                        <IconEdit size={16} />
                    </ActionIcon>
                    <Menu shadow="md" width={200} position="bottom-end">
                        <Menu.Target>
                            <ActionIcon variant="subtle" color="gray">
                                <IconDotsVertical size={16} />
                            </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                            <Menu.Item leftSection={<IconExternalLink size={14} />} disabled={!author.websiteUrl}>
                                Visit Website
                            </Menu.Item>
                            <Menu.Divider />
                            <Menu.Item
                                color="red"
                                leftSection={<IconTrash size={14} />}
                                onClick={() => handleDelete(author.id)}
                            >
                                Delete
                            </Menu.Item>
                        </Menu.Dropdown>
                    </Menu>
                </Group>
            </Table.Td>
        </Table.Tr>
    ));

    return (
        <Stack gap="lg">
            <Group justify="space-between" align="center">
                <div>
                    <Title order={2}>Authors</Title>
                    <Text c="dimmed" size="sm">Manage authors for this website</Text>
                </div>
                <Button leftSection={<IconPlus size={16} />} onClick={() => setOpened(true)}>
                    Add Author
                </Button>
            </Group>

            <Paper withBorder p="md" radius="md">
                <Table verticalSpacing="sm">
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>Author</Table.Th>
                            <Table.Th>Slug</Table.Th>
                            <Table.Th style={{ width: 100 }} />
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>{rows}</Table.Tbody>
                </Table>
                {authors?.length === 0 && (
                    <Text ta="center" py="xl" c="dimmed">No authors found.</Text>
                )}
            </Paper>

            <ModularModal
                isLoading={createIsPending}
                opened={opened} onClose={() => setOpened(false)}
                onSubmit={createForm.onSubmit(handleCreate)}
                title="Add New Author">
                <Stack>
                    <TextInput
                        label="Name"
                        placeholder="John Doe"
                        required
                        {...createForm.getInputProps('name')}
                    />
                    <TextInput
                        label="Slug"
                        placeholder="john-doe"
                        required
                        {...createForm.getInputProps('slug')}
                    />
                    <Textarea
                        label="Bio"
                        placeholder="Short bio..."
                        {...createForm.getInputProps('bio')}
                    />
                </Stack>
            </ModularModal>
        </Stack>
    );
}