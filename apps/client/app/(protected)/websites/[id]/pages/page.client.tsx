'use client'

import { ModularModal } from "@/app/(protected)/components/modal";
import { notify } from "@/app/components/notifications";
import { useClientApi } from "@/lib/hooks/client.api";
import {
    ActionIcon,
    Box,
    Button,
    Flex,
    Group,
    Menu,
    Paper,
    Stack,
    Switch,
    Text,
    TextInput
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import type { StaticPage } from "@repo/database";
import { IconDotsVertical, IconEdit, IconExternalLink, IconFileText, IconPlus, IconTrash } from "@tabler/icons-react";
import MDEditor, { commands } from "@uiw/react-md-editor";
import { useEffect, useState } from "react";

const PagesPageClient = ({ websiteId, pages }: { websiteId: string, pages: StaticPage[] }) => {
    const [opened, { open, close }] = useDisclosure(false);
    const [isEdit, setIsEdit] = useState(true);
    const api = useClientApi();

    const form = useForm({
        initialValues: {
            title: "",
            slug: "",
            content: ""
        }
    });

    const { mutate, isPending } = api.Mutate(
        `/api/websites/{websiteId}/pages`,
        { method: "POST" },
        {
            onSuccess: () => {
                notify.success("Page created successfully");
                form.reset();
                close();
            },
            onError: (error) => {
                notify.error(`Failed to create page: ${error.message}`);
            },
            invalidateKeys: [['pages', websiteId]]
        }
    )

    const getSafeInputProps = (path: string) => {
        const props = form.getInputProps(path as any);
        return { ...props, value: props.value ?? "" };
    };

    const slugConverter = (title: string) => {
        return title.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    }

    useEffect(() => {
        if (!form.values.slug || form.isDirty('title')) {
            form.setFieldValue('slug', slugConverter(form.values.title));
        }
    }, [form.values.title]);

    const handleSubmit = () => {
        mutate({
            params: { id: websiteId },
            body: form.values,
        });
    }

    const handleEdit = (id: string) => {
        const pageToEdit = pages.find((p) => p.id === id);
        if (pageToEdit) {
            setIsEdit(true);
            form.setValues({
                title: pageToEdit.title || "",
                slug: pageToEdit.slug || "",
                content: pageToEdit.content || ""
            });
            open();
        }
    }

    const renderPageItem = (page: StaticPage) => (
        <Paper key={page.id} withBorder p="md" radius="md" shadow="xs">
            <Group justify="space-between" align="center" wrap="nowrap">
                <Group gap="sm" style={{ flex: 1, minWidth: 0 }}>
                    <ActionIcon variant="light" color="blue" size="lg" radius="md">
                        <IconFileText size={20} />
                    </ActionIcon>
                    <Box style={{ flex: 1, minWidth: 0 }}>
                        <Text fw={600} size="sm" truncate="end">
                            {page.title}
                        </Text>
                        <Text size="xs" c="dimmed" truncate="end">
                            /{page.slug}
                        </Text>
                    </Box>
                </Group>

                <Group gap={4}>
                    <Menu shadow="md" width={200} position="bottom-end" withinPortal>
                        <Menu.Target>
                            <ActionIcon variant="subtle" color="gray" size="md">
                                <IconDotsVertical size={18} />
                            </ActionIcon>
                        </Menu.Target>

                        <Menu.Dropdown>
                            <Menu.Label>Actions</Menu.Label>
                            <Menu.Item
                                leftSection={<IconEdit size={14} />}
                                onClick={() => handleEdit(page.id)}
                            >
                                Edit Page
                            </Menu.Item>
                            <Menu.Item
                                leftSection={<IconExternalLink size={14} />}
                                component="a"
                                href={`/preview/${page.slug}`}
                                target="_blank"
                            >
                                Preview
                            </Menu.Item>
                            <Menu.Divider />
                            <Menu.Label>Danger Zone</Menu.Label>
                            <Menu.Item
                                color="red"
                                leftSection={<IconTrash size={14} />}
                            >
                                Delete Page
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
                    onClick={() => {
                        form.reset();
                        open();
                    }}
                    radius="md"
                    mt="xs"
                >
                    Create New Page
                </Button>
            </Stack>

            <Stack gap="sm">
                {pages.length > 0 ? (
                    pages.map(renderPageItem)
                ) : (
                    <Paper withBorder p="xl" radius="md" bg="gray.0">
                        <Text ta="center" size="sm" c="dimmed">No pages created yet.</Text>
                    </Paper>
                )}
            </Stack>

            <ModularModal
                opened={opened}
                onClose={close}
                isLoading={isPending}
                onSubmit={handleSubmit}
                title="Page Editor"
                size="100%"
            >
                <Stack gap="md">
                    <Stack gap="xs">
                        <TextInput
                            label="Title"
                            placeholder="About Us"
                            {...getSafeInputProps('title')}
                            required
                        />
                        <TextInput
                            label="Slug"
                            placeholder="about-us"
                            {...getSafeInputProps('slug')}
                            required
                        />
                    </Stack>

                    <Stack gap={5}>
                        <Flex justify="space-between" align="center">
                            <Text fw={500} size="sm">Content</Text>
                            <Switch
                                size="sm"
                                onLabel="EDIT"
                                offLabel="VIEW"
                                checked={isEdit}
                                onChange={(event) => setIsEdit(event.currentTarget.checked)}
                            />
                        </Flex>
                        <Box style={{ border: '1px solid #ced4da', borderRadius: '8px', overflow: 'hidden' }}>
                            <MDEditor
                                height={isEdit ? 450 : 500}
                                preview={isEdit ? "edit" : "preview"}
                                hideToolbar={!isEdit}
                                extraCommands={[
                                    commands.fullscreen,
                                    commands.codeEdit,
                                    commands.codeLive,
                                    commands.codePreview
                                ]}
                                {...getSafeInputProps('content')}
                            />
                        </Box>
                    </Stack>
                </Stack>
            </ModularModal>
        </Stack>
    );
}

const Title = ({ order, children }: { order: number, children: React.ReactNode }) => (
    <Text fw={700} size={order === 3 ? "xl" : "md"}>{children}</Text>
);

export default PagesPageClient;