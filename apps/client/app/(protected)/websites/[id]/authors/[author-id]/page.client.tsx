'use client';

import { useClientApi } from '@/lib/hooks/client.api';
import {
    Avatar,
    Button,
    Divider,
    FileButton,
    Grid,
    Group,
    Paper,
    SimpleGrid,
    Stack,
    Text,
    TextInput,
    Textarea,
    Title
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { Author } from '@repo/database';
import { IconArrowLeft, IconDeviceFloppy, IconUpload } from '@tabler/icons-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface AuthorDetailPageClientProps {
    websiteId: string;
    authorId: string;
    initialData: Author | null;
}

export default function AuthorDetailPageClient({ websiteId, authorId, initialData }: AuthorDetailPageClientProps) {
    const { Get, Mutate } = useClientApi();
    const [file, setFile] = useState<File | null>(null);

    console.log(file);

    const { data: author, isLoading } = Get<Author>(
        `/api/websites/${websiteId}/authors/${authorId}`,
        ['authors', authorId],
        { enabled: !!initialData }
    );

    const form = useForm({
        initialValues: {
            name: '',
            slug: '',
            image: '',
            bio: '',
            websiteUrl: '',
            twitter: '',
            instagram: '',
            facebook: '',
            linkedIn: '',
        },
        validate: {
            name: (val) => (val.length < 2 ? 'Name is too short' : null),
            slug: (val) => (val.length < 2 ? 'Slug is required' : null),
        },
    });

    useEffect(() => {
        if (author) {
            form.setValues({
                name: author.name || '',
                slug: author.slug || '',
                image: author.image || '',
                bio: author.bio || '',
                websiteUrl: author.websiteUrl || '',
                twitter: author.twitter || '',
                instagram: author.instagram || '',
                facebook: author.facebook || '',
                linkedIn: author.linkedIn || '',
            });
        }
    }, [author]);

    const updateMutation = Mutate<Author, any>(
        `/api/websites/{websiteId}/authors`,
        { method: 'PATCH' },
        {
            onSuccess: (data: unknown) => {
                console.log("Updated", data);
            },
            invalidateKeys: [['websites', websiteId, 'authors', authorId], ['websites', websiteId, 'authors']]
        }
    );

    const handleSave = (values: typeof form.values) => {
        updateMutation.mutate({ params: { id: websiteId, authorId }, ...values });
    };

    if (!author && !isLoading) return <Text>Author not found</Text>;

    return (
        <Stack gap="lg" pb={80}>
            <Stack gap="xs" px={{ base: 'md', md: 0 }} pt={{ base: 'md', md: 0 }}>
                <Group justify="space-between" align="center">
                    <Group gap="xs">
                        <Button
                            component={Link}
                            href={`/websites/${websiteId}/authors`}
                            variant="filled"
                            color="orange.0"
                            c={"orange.5"}
                            leftSection={<IconArrowLeft size={20} />}
                        >
                            Back
                        </Button>
                    </Group>

                    <Button
                        leftSection={<IconDeviceFloppy size={18} />}
                        loading={updateMutation.isPending}
                        onClick={() => form.onSubmit(handleSave)}
                    >
                        Save Changes
                    </Button>
                </Group>
            </Stack>

            <Grid gutter="lg">
                <Grid.Col span={12}>
                    <Stack gap="md">
                        <Paper p="md" >
                            <Stack align="center" gap="md">
                                <Avatar
                                    src={form.values.image}
                                    size={120}
                                    radius={120}
                                    alt="Author Image"
                                    color="initials"
                                    name={form.values.name}
                                    styles={{ root: { border: '4px solid white', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' } }}
                                />
                                <FileButton onChange={setFile} accept="image/png,image/jpeg">
                                    {(props) =>
                                        <Button {...props} leftSection={<IconUpload size={16} />}>
                                            Upload image
                                        </Button>}
                                </FileButton>
                            </Stack>
                        </Paper>

                        <Paper withBorder p="md" radius="md" shadow="sm">
                            <Title order={5} mb="md">Social Profiles</Title>
                            <Stack gap="sm">
                                <TextInput
                                    leftSection={<Text size="xs" c="dimmed">X</Text>}
                                    placeholder="@username"
                                    {...form.getInputProps('twitter')}
                                />
                                <TextInput
                                    leftSection={<Text size="xs" c="dimmed">IG</Text>}
                                    placeholder="@username"
                                    {...form.getInputProps('instagram')}
                                />
                                <TextInput
                                    leftSection={<Text size="xs" c="dimmed">FB</Text>}
                                    placeholder="Profile URL"
                                    {...form.getInputProps('facebook')}
                                />
                                <TextInput
                                    leftSection={<Text size="xs" c="dimmed">IN</Text>}
                                    placeholder="Profile URL"
                                    {...form.getInputProps('linkedIn')}
                                />
                            </Stack>
                        </Paper>
                    </Stack>
                </Grid.Col>

                <Grid.Col span={12}>
                    <Paper withBorder p="md" radius="md" shadow="sm">
                        <Stack gap="md">
                            <Title order={4}>General Information</Title>
                            <Divider />

                            <SimpleGrid cols={{ base: 1, sm: 2 }}>
                                <TextInput
                                    label="Name"
                                    required
                                    description="Author's full name"
                                    {...form.getInputProps('name')}
                                />
                                <TextInput
                                    label="Slug"
                                    required
                                    description="URL-friendly version"
                                    {...form.getInputProps('slug')}
                                />
                            </SimpleGrid>

                            <TextInput
                                label="Website URL"
                                description="Author's website URL"
                                placeholder="https://author-website.com"
                                {...form.getInputProps('websiteUrl')}
                            />

                            <Textarea
                                label="Biography"
                                description="A short biography about the author"
                                placeholder="Tell us about this author..."
                                minRows={6}
                                autosize
                                {...form.getInputProps('bio')}
                            />
                        </Stack>
                    </Paper>
                </Grid.Col>
            </Grid>
        </Stack>
    );
}