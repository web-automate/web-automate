import { Accordion, Flex, Grid, Select, Stack, Switch, TagsInput, Text, TextInput, Textarea } from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import { IconArticle, IconCamera, IconClock, IconFileText, IconTag } from "@tabler/icons-react";
import MDEditor, { commands } from "@uiw/react-md-editor";
import { useState } from "react";

export function ArticleForm({ form }: { form: UseFormReturnType<any> }) {
    const [isEdit, setIsEdit] = useState(true);

    const getSafeInputProps = (path: string) => {
        const props = form.getInputProps(path as any);
        return { ...props, value: props.value ?? "" };
    };

    const getSafeArrayProps = (path: string) => {
        const props = form.getInputProps(path as any);
        return { ...props, value: props.value ?? [] };
    };

    const getSafeSelectProps = (path: string) => {
        const props = form.getInputProps(path as any);
        return { ...props, value: props.value ?? undefined };
    };

    const getSafeDateProps = (path: string) => {
        const props = form.getInputProps(path as any);
        return { ...props, value: props.value ? new Date(props.value) : null };
    };

    return (
        <Accordion variant="separated" multiple defaultValue={['basic', 'content', 'meta', 'publishing']}>
            <Accordion.Item value="basic">
                <Accordion.Control icon={<IconArticle color="var(--mantine-color-blue-6)" size={20} />}>
                    Basic Information
                </Accordion.Control>
                <Accordion.Panel>
                    <Stack gap="md">
                        <TextInput
                            label="Topic"
                            placeholder="Main topic of the article"
                            description="The primary subject matter"
                            required
                            {...getSafeInputProps('topic')}
                        />
                        <TextInput
                            label="Title"
                            placeholder="Article title"
                            description="SEO-friendly article title"
                            {...getSafeInputProps('title')}
                        />
                        <Grid>
                            <Grid.Col span={{ base: 12, sm: 6 }}>
                                <TextInput
                                    label="Category"
                                    placeholder="e.g., Technology, Health, Business"
                                    required
                                    {...getSafeInputProps('category')}
                                />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, sm: 6 }}>
                                <TextInput
                                    label="Sub Category"
                                    placeholder="Optional sub-category"
                                    {...getSafeInputProps('subCategory')}
                                />
                            </Grid.Col>
                        </Grid>
                        <TextInput
                            label="Slug"
                            placeholder="url-friendly-slug"
                            description="URL-friendly version of the title"
                            {...getSafeInputProps('slug')}
                        />
                    </Stack>
                </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item value="content">
                <Accordion.Control icon={<IconFileText color="var(--mantine-color-blue-6)" size={20} />}>
                    Content
                </Accordion.Control>
                <Accordion.Panel>
                    <Stack gap="md">
                        <Textarea
                            label="Excerpt"
                            placeholder="Brief summary of the article"
                            description="Short description that appears in previews"
                            minRows={3}
                            maxRows={5}
                            {...getSafeInputProps('excerpt')}
                        />
                        <Stack gap="xs">
                            <Flex justify="space-between" align="center">
                                <Text fw={500} size="sm">Content (Markdown)</Text>
                                <Switch
                                    size="sm"
                                    label={isEdit ? "Edit Mode" : "Preview Mode"}
                                    checked={isEdit}
                                    onChange={(event) => setIsEdit(event.currentTarget.checked)}
                                />
                            </Flex>
                            <MDEditor
                                height={500}
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
                        </Stack>
                    </Stack>
                </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item value="meta">
                <Accordion.Control icon={<IconTag color="var(--mantine-color-blue-6)" size={20} />}>
                    Meta & SEO
                </Accordion.Control>
                <Accordion.Panel>
                    <Stack gap="md">
                        <TagsInput
                            label="Keywords"
                            placeholder="Press Enter to add keyword"
                            description="SEO keywords for the article"
                            required
                            {...getSafeArrayProps('keywords')}
                        />
                        <TextInput
                            label="Featured Image URL"
                            placeholder="https://example.com/image.jpg"
                            description="Main image for the article"
                            leftSection={<IconCamera size={16} />}
                            {...getSafeInputProps('featuredImage')}
                        />
                    </Stack>
                </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item value="publishing">
                <Accordion.Control icon={<IconClock color="var(--mantine-color-blue-6)" size={20} />}>
                    Publishing Settings
                </Accordion.Control>
                <Accordion.Panel>
                    <Stack gap="md">
                        <Select
                            label="Status"
                            placeholder="Select article status"
                            description="Current publication status"
                            data={[
                                { value: 'DRAFT', label: 'Draft' },
                                { value: 'PUBLISHED', label: 'Published' },
                                { value: 'SCHEDULED', label: 'Scheduled' },
                                { value: 'ARCHIVED', label: 'Archived' },
                            ]}
                            {...getSafeSelectProps('status')}
                        />
                    </Stack>
                </Accordion.Panel>
            </Accordion.Item>
        </Accordion>
    );
}