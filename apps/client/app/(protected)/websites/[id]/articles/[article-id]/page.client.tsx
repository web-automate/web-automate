'use client';
import { useClientApi } from "@/lib/hooks/client.api";
import { Affix, Button, Container, em, Group, rem, Stack, Tabs, Title, Transition } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useMediaQuery } from "@mantine/hooks";
import { Notifications, notifications } from "@mantine/notifications";
import { Article } from "@repo/database";
import { IconArticle, IconDeviceFloppy, IconSeo } from "@tabler/icons-react";
import { ArticleForm } from "./components/forms/article";
import { SeoForm } from "./components/forms/seo";

interface Props {
    article: Article;
}

const prepareUpdateData = (formValues: any) => {
    const {
        id,
        websiteId,
        authorId,
        createdById,
        createdAt,
        updatedAt,
        website,
        author,
        createdBy,
        seo,
        ...articleData
    } = formValues;

    const cleanSeo = seo ? {
        metaTitle: seo.metaTitle || null,
        metaDescription: seo.metaDescription || null,
        keywords: seo.keywords || [],
        author: seo.author || null,
        language: seo.language || 'English',
        robots: seo.robots || 'index_follow',
        canonicalUrl: seo.canonicalUrl || null,
        ogTitle: seo.ogTitle || null,
        ogDescription: seo.ogDescription || null,
        ogImage: seo.ogImage || null,
        ogUrl: seo.ogUrl || null,
        ogSiteName: seo.ogSiteName || null,
        ogType: seo.ogType || 'article',
        ogPublishedTime: seo.ogPublishedTime || null,
        ogAuthor: seo.ogAuthor || null,
        twitterCard: seo.twitterCard || 'summary_large_image',
        twitterTitle: seo.twitterTitle || null,
        twitterDescription: seo.twitterDescription || null,
        twitterImage: seo.twitterImage || null,
        twitterCreator: seo.twitterCreator || null,
        twitterUrl: seo.twitterUrl || null,
        structuredData: seo.structuredData || null,
    } : undefined;

    return {
        ...articleData,
        seo: cleanSeo,
    };
};

export function ArticleDetailClient({ article }: Props) {
    const api = useClientApi();
    const isMobile = useMediaQuery(`(max-width: ${em(768)})`);

    const form = useForm<Article>({
        initialValues: {
            ...article,
            topic: article.topic || '',
            title: article.title || '',
            slug: article.slug || '',
            category: article.category || '',
            subCategory: article.subCategory || '',
            keywords: article.keywords || [],
            excerpt: article.excerpt || '',
            content: article.content || '',
            featuredImage: article.featuredImage || '',
            status: article.status || 'DRAFT',
            publishedAt: article.publishedAt || null,
        },
    });

    const { mutate, isPending } = api.Mutate(
        `/api/websites/{id}/articles/{article-id}`,
        { method: "PATCH" },
        { 
            onSuccess: () => {
                console.log("Article Updated Successfully");
                notifications.show({
                    message: "Article updated successfully",
                    position: "top-center",
                    color: "green",
                });
            },
            onError: (error) => {
                console.error("Failed to update article:", error);
            }
        }
    );

    const handleSave = () => {
        const cleanData = prepareUpdateData(form.values);
        mutate({
            params: {
                id: article.websiteId,
                "article-id": article.id,
            },
            body: cleanData,
        });
    };

    if (!article) return null;

    return (
        <Container size="lg" p={0}>
        <Notifications />

            <Stack gap="md">
                <Group justify="space-between">
                    <Title order={2}>{article.title || 'Untitled Article'}</Title>
                </Group>

                <Tabs defaultValue="content">
                    <Tabs.List>
                        <Tabs.Tab value="content" leftSection={<IconArticle size={16} />}>
                            Content
                        </Tabs.Tab>
                        <Tabs.Tab value="seo" leftSection={<IconSeo size={16} />}>
                            SEO & Meta
                        </Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="content" pt="md">
                        <ArticleForm form={form} />
                    </Tabs.Panel>

                    <Tabs.Panel value="seo" pt="md">
                        <SeoForm form={form} />
                    </Tabs.Panel>
                </Tabs>
            </Stack>

            <Affix position={{ bottom: isMobile ? 120 : 20, right: 20 }}>
                <Transition transition="slide-up" mounted={true}>
                    {(transitionStyles) => (
                        <Button
                            style={transitionStyles}
                            leftSection={<IconDeviceFloppy size={20} />}
                            radius="xl"
                            size={isMobile ? "md" : "lg"}
                            onClick={handleSave}
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
                            Save Changes
                        </Button>
                    )}
                </Transition>
            </Affix>
        </Container>
    );
}