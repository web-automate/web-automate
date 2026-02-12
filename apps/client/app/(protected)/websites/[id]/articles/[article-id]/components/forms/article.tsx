'use client'

import { ModularModal } from "@/app/(protected)/components/modal";
import { notify } from "@/app/components/notifications";
import { useClientApi } from "@/lib/hooks/client.api";
import { Accordion, ActionIcon, AspectRatio, Button, Center, Flex, Grid, Group, Image, Input, Paper, rem, Select, Stack, Switch, TagsInput, Text, Textarea, TextInput } from "@mantine/core";
import { useForm, UseFormReturnType } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { Article } from "@repo/database";
import { ToneImageEnum } from "@repo/types";
import { IconArticle, IconClock, IconFileText, IconLink, IconPhoto, IconRefresh, IconTag, IconWand, IconX } from "@tabler/icons-react";
import MDEditor, { commands } from "@uiw/react-md-editor";
import { useState } from "react";

export function ArticleForm({ form }: { form: UseFormReturnType<Article> }) {
    const [isEdit, setIsEdit] = useState(true);
    const [isFeaturedImageModalOpen, { open: openFeaturedImageModal, close: closeFeaturedImageModal }] = useDisclosure(false);
    const api = useClientApi();

    const { mutate: generateFeaturedImage, isPending } = api.Mutate(
        `/api/websites/{id}/articles/{article-id}/featured-image`,
        {
            method: "POST",
        },
        {
            onSuccess: () => {
                notify.success("Image generated successfully");
                closeFeaturedImageModal();
            },
            onError: (error) => {
                notify.error("Error generating image. Please try again.");
                console.error("Error generating image:", error);
            },
        }
    );

    const formFeaturedImage = useForm({
        initialValues: {
            prompt: `Generate a image about ${form.values.topic}`,
            tone: ToneImageEnum.realisticPhoto,
        },
    });

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

    const handleGenerateFeaturedImage = () => {
        openFeaturedImageModal();
    };

    return (
        <><Accordion variant="separated" multiple defaultValue={['basic', 'content', 'meta', 'publishing']}>
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
                            {...getSafeInputProps('topic')} />
                        <TextInput
                            label="Title"
                            placeholder="Article title"
                            description="SEO-friendly article title"
                            {...getSafeInputProps('title')} />
                        <Grid>
                            <Grid.Col span={{ base: 12, sm: 6 }}>
                                <TextInput
                                    label="Category"
                                    placeholder="e.g., Technology, Health, Business"
                                    required
                                    {...getSafeInputProps('category')} />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, sm: 6 }}>
                                <TextInput
                                    label="Sub Category"
                                    placeholder="Optional sub-category"
                                    {...getSafeInputProps('subCategory')} />
                            </Grid.Col>
                        </Grid>
                        <TextInput
                            label="Slug"
                            placeholder="url-friendly-slug"
                            description="URL-friendly version of the title"
                            {...getSafeInputProps('slug')} />
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
                            {...getSafeInputProps('excerpt')} />
                        <Stack gap="xs">
                            <Flex justify="space-between" align="center">
                                <Text fw={500} size="sm">Content (Markdown)</Text>
                                <Switch
                                    size="sm"
                                    label={isEdit ? "Edit Mode" : "Preview Mode"}
                                    checked={isEdit}
                                    onChange={(event) => setIsEdit(event.currentTarget.checked)} />
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
                                {...getSafeInputProps('content')} />
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
                            {...getSafeArrayProps('keywords')} />
                        <Input.Wrapper
                            label="Featured Image"
                            description="Main image for the article"
                            mb="md"
                        >
                            <Paper withBorder radius="md" style={{ overflow: "hidden" }} mt="xs">
                                <AspectRatio ratio={16 / 9} bg="var(--mantine-color-gray-1)">
                                    {form.values.featuredImage ? (
                                        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                                            <Image
                                                src={form.values.featuredImage}
                                                alt="Featured Image"
                                                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                                            />

                                            <Group gap="xs" style={{ position: 'absolute', top: 10, right: 10 }}>
                                                <Button
                                                    size="xs"
                                                    variant="white"
                                                    color="blue"
                                                    leftSection={<IconRefresh size={14} />}
                                                    onClick={handleGenerateFeaturedImage}
                                                    loading={isPending}
                                                >
                                                    Regenerate
                                                </Button>
                                                <ActionIcon
                                                    variant="white"
                                                    color="red"
                                                    onClick={() => form.setFieldValue('featuredImage', '')}
                                                >
                                                    <IconX size={16} />
                                                </ActionIcon>
                                            </Group>
                                        </div>
                                    ) : (
                                        <Center h="100%">
                                            <Stack align="center" gap="xs">
                                                <IconPhoto style={{ width: rem(40), height: rem(40) }} color="var(--mantine-color-gray-5)" />
                                                <Text c="dimmed" size="sm">No image selected</Text>
                                                <Button
                                                    variant="light"
                                                    size="xs"
                                                    leftSection={<IconWand size={14} />}
                                                    onClick={handleGenerateFeaturedImage}
                                                >
                                                    Generate AI Image
                                                </Button>
                                            </Stack>
                                        </Center>
                                    )}
                                </AspectRatio>

                                <div style={{ padding: '10px', borderTop: '1px solid var(--mantine-color-gray-3)' }}>
                                    <TextInput
                                        placeholder="https://example.com/image.jpg"
                                        size="xs"
                                        leftSection={<IconLink size={14} />}
                                        rightSectionWidth={80}
                                        {...getSafeInputProps('featuredImage')}
                                        styles={{
                                            input: { border: 'none', backgroundColor: 'transparent' }
                                        }}
                                    />
                                </div>
                            </Paper>
                        </Input.Wrapper>
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
                            {...getSafeSelectProps('status')} />
                    </Stack>
                </Accordion.Panel>
            </Accordion.Item>
        </Accordion>

            <ModularModal
                opened={isFeaturedImageModalOpen}
                onClose={closeFeaturedImageModal}
                title="Generate Featured Image"
                isLoading={isPending}
                onSubmit={() => {
                    generateFeaturedImage({
                        params: {
                            id: form.values.websiteId,
                            "article-id": form.values.id
                        },
                        body: {
                            ...formFeaturedImage.values,
                        }
                    })
                }}
            >
                <Select
                    label="Image Style"
                    placeholder="Select image style"
                    description="Style for the generated image"
                    unselectable="on"
                    defaultValue={ToneImageEnum.realisticPhoto}
                    data={Object.values(ToneImageEnum).map((value) => ({
                        value,
                        label: value.replace(/([A-Z])/g, ' $1').trim()
                    }))}
                    {...formFeaturedImage.getInputProps('tone')} />
            </ModularModal></>
    );
}