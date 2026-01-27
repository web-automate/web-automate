import { Accordion, Grid, JsonInput, Select, Stack, TextInput, Textarea } from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import { IconBrandFacebook, IconBrandTwitter, IconFileCode, IconSeo } from "@tabler/icons-react";

export function SeoForm({ form }: { form: UseFormReturnType<any> }) {
    const getSafeInputProps = (path: string) => {
        const props = form.getInputProps(path as any);
        return { ...props, value: props.value ?? "" };
    };

    const getSafeSelectProps = (path: string) => {
        const props = form.getInputProps(path as any);
        return { ...props, value: props.value ?? undefined };
    };

    const getSafeDateProps = (path: string) => {
        const props = form.getInputProps(path as any);
        return { ...props, value: props.value ?? new Date().toISOString().substring(0, 10) };
    };

    return (
        <Accordion variant="separated" multiple defaultValue={['primary', 'opengraph', 'twitter', 'structured']}>
            <Accordion.Item value="primary">
                <Accordion.Control icon={<IconSeo color="var(--mantine-color-blue-6)" size={20} />}>
                    Primary Meta Tags
                </Accordion.Control>
                <Accordion.Panel>
                    <Stack gap="md">
                        <TextInput
                            label="Meta Title"
                            placeholder="Enter SEO optimized title"
                            description="Recommended: 50-60 characters"
                            {...getSafeInputProps('seo.metaTitle')}
                        />
                        <Textarea
                            label="Meta Description"
                            placeholder="Enter meta description"
                            description="Recommended: 150-160 characters"
                            minRows={3}
                            {...getSafeInputProps('seo.metaDescription')}
                        />
                        <Grid>
                            <Grid.Col span={6}>
                                <TextInput
                                    label="Author"
                                    placeholder="Article author name"
                                    {...getSafeInputProps('seo.author')}
                                />
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <TextInput
                                    label="Language"
                                    placeholder="e.g., English, Indonesian"
                                    {...getSafeInputProps('seo.language')}
                                />
                            </Grid.Col>
                        </Grid>
                        <TextInput
                            label="Canonical URL"
                            placeholder="https://example.com/article"
                            description="Preferred URL for this content"
                            {...getSafeInputProps('seo.canonicalUrl')}
                        />
                        <Select
                            label="Robots Meta Tag"
                            placeholder="Select robots directive"
                            data={[
                                { value: 'index_follow', label: 'Index, Follow' },
                                { value: 'index_nofollow', label: 'Index, No Follow' },
                                { value: 'noindex_follow', label: 'No Index, Follow' },
                                { value: 'noindex_nofollow', label: 'No Index, No Follow' },
                            ]}
                            {...getSafeSelectProps('seo.robots')}
                        />
                    </Stack>
                </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item value="opengraph">
                <Accordion.Control icon={<IconBrandFacebook color="var(--mantine-color-blue-6)" size={20} />}>
                    Open Graph (Facebook)
                </Accordion.Control>
                <Accordion.Panel>
                    <Stack gap="md">
                        <Select
                            label="OG Type"
                            placeholder="Select content type"
                            data={[
                                { value: 'article', label: 'Article' },
                                { value: 'website', label: 'Website' },
                                { value: 'blog', label: 'Blog' },
                                { value: 'product', label: 'Product' },
                            ]}
                            {...getSafeSelectProps('seo.ogType')}
                        />
                        <TextInput
                            label="OG Title"
                            placeholder="Title for social media sharing"
                            {...getSafeInputProps('seo.ogTitle')}
                        />
                        <Textarea
                            label="OG Description"
                            placeholder="Description for social media sharing"
                            minRows={3}
                            {...getSafeInputProps('seo.ogDescription')}
                        />
                        <TextInput
                            label="OG Image URL"
                            placeholder="https://example.com/image.jpg"
                            description="Recommended: 1200x630px"
                            {...getSafeInputProps('seo.ogImage')}
                        />
                        <Grid>
                            <Grid.Col span={6}>
                                <TextInput
                                    label="OG URL"
                                    placeholder="https://example.com/article"
                                    {...getSafeInputProps('seo.ogUrl')}
                                />
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <TextInput
                                    label="OG Site Name"
                                    placeholder="Your Site Name"
                                    {...getSafeInputProps('seo.ogSiteName')}
                                />
                            </Grid.Col>
                        </Grid>
                        <Grid>
                            <Grid.Col span={6}>
                                <TextInput
                                    label="Article Published Time"
                                    type="datetime-local"
                                    {...getSafeDateProps('seo.ogPublishedTime')}
                                />
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <TextInput
                                    label="Article Author"
                                    placeholder="Author name for OG"
                                    {...getSafeInputProps('seo.ogAuthor')}
                                />
                            </Grid.Col>
                        </Grid>
                    </Stack>
                </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item value="twitter">
                <Accordion.Control icon={<IconBrandTwitter color="var(--mantine-color-blue-6)" size={20} />}>
                    Twitter Cards
                </Accordion.Control>
                <Accordion.Panel>
                    <Stack gap="md">
                        <Select
                            label="Twitter Card Type"
                            placeholder="Select card type"
                            data={[
                                { value: 'summary', label: 'Summary' },
                                { value: 'summary_large_image', label: 'Summary Large Image' },
                                { value: 'app', label: 'App' },
                                { value: 'player', label: 'Player' },
                            ]}
                            {...getSafeSelectProps('seo.twitterCard')}
                        />
                        <TextInput
                            label="Twitter Title"
                            placeholder="Title for Twitter card"
                            {...getSafeInputProps('seo.twitterTitle')}
                        />
                        <Textarea
                            label="Twitter Description"
                            placeholder="Description for Twitter card"
                            minRows={3}
                            {...getSafeInputProps('seo.twitterDescription')}
                        />
                        <TextInput
                            label="Twitter Image URL"
                            placeholder="https://example.com/twitter-image.jpg"
                            description="Recommended: 1200x628px"
                            {...getSafeInputProps('seo.twitterImage')}
                        />
                        <Grid>
                            <Grid.Col span={6}>
                                <TextInput
                                    label="Twitter Creator"
                                    placeholder="@username"
                                    {...getSafeInputProps('seo.twitterCreator')}
                                />
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <TextInput
                                    label="Twitter URL"
                                    placeholder="https://example.com/article"
                                    {...getSafeInputProps('seo.twitterUrl')}
                                />
                            </Grid.Col>
                        </Grid>
                    </Stack>
                </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item value="structured">
                <Accordion.Control icon={<IconFileCode color="var(--mantine-color-blue-6)" size={20} />}>
                    Structured Data (JSON-LD)
                </Accordion.Control>
                <Accordion.Panel>
                    <Stack gap="md">
                        <JsonInput
                            label="JSON-LD Schema"
                            placeholder={`{
"@context": "https://schema.org",
"@type": "Article",
"headline": "Article headline",
"author": {
    "@type": "Person",
    "name": "Author Name"
},
"datePublished": "2024-01-01",
"image": "https://example.com/image.jpg"
}`}                                
                            description="Schema.org structured data for rich results"
                            validationError="Invalid JSON format"
                            formatOnBlur
                            autosize
                            minRows={8}
                            maxRows={20}
                            {...getSafeInputProps('seo.structuredData')}
                        />
                    </Stack>
                </Accordion.Panel>
            </Accordion.Item>
        </Accordion>
    );
}