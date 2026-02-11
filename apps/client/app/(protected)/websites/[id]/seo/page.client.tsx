'use client'

import { notify } from "@/app/components/notifications";
import { useClientApi } from "@/lib/hooks/client.api";
import {
    Affix,
    Button,
    Divider,
    Group,
    Paper,
    Stack,
    Text,
    TextInput,
    Textarea,
    Transition,
    em,
    rem
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useMediaQuery } from "@mantine/hooks";
import type { WebsiteSeo } from "@repo/database";
import { IconBrandTwitter, IconDeviceFloppy, IconShare, IconWorld } from "@tabler/icons-react";

const SEOPageClient = ({ id, seo }: { id: string, seo: WebsiteSeo }) => {
    const api = useClientApi();
    const isMobile = useMediaQuery(`(max-width: ${em(768)})`);

    const { mutate, isPending } = api.Mutate(
        `/api/websites/{id}/seos`,
        { method: "PATCH" },
        {
            onSuccess: () => {
                notify.success("SEO settings saved");
            },
            onError: () => {
                notify.error("Failed to save SEO settings");
            },
            invalidateKeys: [['websites', id]]
        }
    );

    const form = useForm<WebsiteSeo>({
        initialValues: {
            ...seo,
        },
    });

    const handleSave = (values: WebsiteSeo) => {
        mutate({ params: { id }, body: values });
    };

    return (
        <form onSubmit={form.onSubmit(handleSave)}>
            <Stack gap="lg">
                <Paper withBorder p="md" radius="md" shadow="xs">
                    <Stack gap="sm">
                        <Group gap="xs">
                            <IconWorld size={18} stroke={1.5} />
                            <Text fw={600} size="sm">General SEO</Text>
                        </Group>
                        <Divider />
                        <TextInput label="Meta Title" placeholder="Main title of your site" {...form.getInputProps("title")} />
                        <Textarea label="Meta Description" placeholder="Brief summary for search results" minRows={3} {...form.getInputProps("description")} />
                        <TextInput label="Keywords" placeholder="keyword1, keyword2" {...form.getInputProps("keywords")} />
                        <TextInput label="Author" placeholder="Organization or person name" {...form.getInputProps("author")} />
                        <TextInput label="Canonical URL" placeholder="https://example.com" {...form.getInputProps("canonicalUrl")} />
                        <TextInput label="Robots" placeholder="index, follow" {...form.getInputProps("robots")} />
                    </Stack>
                </Paper>

                <Paper withBorder p="md" radius="md" shadow="xs">
                    <Stack gap="sm">
                        <Group gap="xs">
                            <IconShare size={18} stroke={1.5} />
                            <Text fw={600} size="sm">Social Media (Open Graph)</Text>
                        </Group>
                        <Divider />
                        <TextInput label="OG Title" placeholder="Title for Facebook/WhatsApp" {...form.getInputProps("ogTitle")} />
                        <Textarea label="OG Description" placeholder="Description for social sharing" {...form.getInputProps("ogDescription")} />
                        <TextInput label="OG Image URL" placeholder="https://example.com/image.jpg" {...form.getInputProps("ogImage")} />
                        <TextInput label="OG Type" placeholder="website" {...form.getInputProps("ogType")} />
                    </Stack>
                </Paper>

                <Paper withBorder p="md" radius="md" shadow="xs">
                    <Stack gap="sm">
                        <Group gap="xs">
                            <IconBrandTwitter size={18} stroke={1.5} />
                            <Text fw={600} size="sm">Twitter / X Card</Text>
                        </Group>
                        <Divider />
                        <TextInput label="Twitter Title" {...form.getInputProps("twitterTitle")} />
                        <TextInput label="Twitter Handle" placeholder="@username" {...form.getInputProps("twitterHandle")} />
                        <TextInput label="Twitter Image URL" {...form.getInputProps("twitterImage")} />
                        <TextInput label="Twitter Card Type" placeholder="summary_large_image" {...form.getInputProps("twitterCard")} />
                    </Stack>
                </Paper>

                <Affix position={{ bottom: isMobile ? 120 : 20, right: 20 }}>
                    <Transition transition="slide-up" mounted={true}>
                        {(transitionStyles) => (
                            <Button
                                type="submit"
                                style={transitionStyles}
                                leftSection={<IconDeviceFloppy size={20} />}
                                radius="xl"
                                size={isMobile ? "md" : "lg"}
                                loading={isPending}
                                styles={{
                                    root: {
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                                        height: rem(48),
                                        paddingLeft: rem(20),
                                        paddingRight: rem(20)
                                    }
                                }}
                            >
                                Save SEO Settings
                            </Button>
                        )}
                    </Transition>
                </Affix>
            </Stack>
        </form>
    )
}

export default SEOPageClient;