'use client';

import { notify } from "@/app/components/notifications";
import { getTemplates } from "@/lib/hooks/template";
import { useWebsites } from "@/lib/hooks/use.website";
import {
    ActionIcon,
    Affix,
    Avatar,
    Button,
    Card,
    Center,
    Flex,
    Group,
    Loader,
    Select,
    Stack,
    Text,
    TextInput,
    Transition,
    em,
    rem
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { IconPlus, IconSettings, IconWorld } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import NotFoundData from "../components/data.404";
import { PageHeader } from "../components/header";
import { ModularModal } from "../components/modal";

const WebsitePageClient = () => {
    const { push } = useRouter();
    const queryClient = useQueryClient();
    const [isAddWebsiteModalOpen, { open: openAddWebsiteModal, close: closeAddWebsiteModal }] = useDisclosure(false);
    const isMobile = useMediaQuery(`(max-width: ${em(768)})`);
    const { data: websites, isLoading, isError } = useWebsites();
    const { data: templates, isLoading: isLoadingTemplates, isError: isErrorTemplates } = getTemplates();

    const [formState, setFormState] = useState({
        name: "",
        domain: "",
        templateId: ""
    });

    const resetForm = () => {
        setFormState({ name: "", domain: "", templateId: "" });
    };

    const { mutate: createWebsite, isPending: isCreating } = useMutation({
        mutationFn: async (values: typeof formState) => {
            const res = await fetch("/api/websites", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(errorText || "Failed to create website");
            }

            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["websites"] });
            notify.success("Website created successfully");
            closeAddWebsiteModal();
            resetForm();
        },
        onError: (error) => {
            notify.error(error.message || "Failed to create website");
        },
    });

    const handleAddWebsite = () => {
        if (!formState.name || !formState.domain) {
            notify.warning("Please fill in all required fields");
            return;
        }
        createWebsite(formState);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PUBLISHED': return 'green';
            case 'DRAFT': return 'gray';
            case 'MAINTENANCE': return 'orange';
            default: return 'blue';
        }
    };

    return (
        <Stack pos={"relative"} >
            <PageHeader
                icon={<IconWorld size={32} />}
                title="My Websites"
                description="Kelola project website Anda di sini."
            />

            <Stack mih={200} gap="md" justify="start" align="center">
                {isLoading ? (
                    <Center>
                        <Loader size="lg" />
                    </Center>
                ) : isError ? (
                    <Text>Error loading data</Text>
                ) : (
                    websites && websites?.length > 0 ? (
                        websites.map((website) => (
                            <Card
                                key={website.id}
                                padding="sm"
                                radius="sm"
                                withBorder
                                shadow="sm"
                                w={"100%"}
                            >
                                <Group wrap="nowrap" align="center">
                                    <Avatar
                                        src={website.logoSquare}
                                        alt={website.name}
                                        radius="md"
                                        size="md"
                                        color="blue"
                                    >
                                        {website.name.slice(0, 2).toUpperCase()}
                                    </Avatar>

                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <Text fw={600} size="sm" truncate >
                                            {website.name.charAt(0).toUpperCase() + website.name.slice(1)}
                                        </Text>
                                        <Text size="xs" c="dimmed" truncate>
                                            {website.domain}
                                        </Text>
                                    </div>

                                    <Flex justify="flex-end" gap={6} align="center">
                                        <ActionIcon
                                            variant="light"
                                            size="md"
                                            color={getStatusColor(website.status)}
                                            radius="xs"
                                        >
                                            <IconWorld size={16} />
                                        </ActionIcon>

                                        <Button
                                            variant="light"
                                            size="xs"
                                            rightSection={<IconSettings size={12} />}
                                            onClick={() => {
                                                push(`/websites/${website.id}`);
                                            }}
                                        >
                                            Manage
                                        </Button>
                                    </Flex>
                                </Group>
                            </Card>
                        ))
                    ) : (
                        <NotFoundData
                            title="No Websites Found"
                            description="Tidak ada website yang ditemukan. Silakan buat website baru."
                        />
                    )
                )}
            </Stack>

            <Affix position={{ bottom: isMobile ? 120 : 20, right: 20 }}>
                <Transition transition="slide-up" mounted={true}>
                    {(transitionStyles) => (
                        <Button
                            style={transitionStyles}
                            leftSection={<IconPlus size={20} />}
                            radius="xl"
                            size={isMobile ? "md" : "lg"}
                            onClick={openAddWebsiteModal}
                            styles={{
                                root: {
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                                    height: rem(48),
                                    paddingLeft: rem(20),
                                    paddingRight: rem(20)
                                }
                            }}
                        >
                            Add New
                        </Button>
                    )}
                </Transition>
            </Affix>

            <ModularModal
                opened={isAddWebsiteModalOpen}
                onClose={() => {
                    closeAddWebsiteModal();
                    resetForm();
                }}
                title="Create New Website"
                description="Fill in the details below to create a new website project."
                submitLabel="Create Website"
                onSubmit={handleAddWebsite}
                isLoading={isCreating}
            >
                <Stack gap="md">
                    <TextInput
                        label="Website Name"
                        placeholder="My Awesome Site"
                        description="Project name for internal identification."
                        withAsterisk
                        data-autofocus
                        value={formState.name}
                        onChange={(e) => setFormState({ ...formState, name: e.currentTarget.value })}
                    />

                    <TextInput
                        label="Domain / Subdomain"
                        placeholder="mysite"
                        description="Domain or subdomain for website access."
                        withAsterisk
                        rightSection={<Text size="xs" c="dimmed" mr="md">.com</Text>}
                        value={formState.domain}
                        onChange={(e) => setFormState({ ...formState, domain: e.currentTarget.value })}
                    />

                    <Select
                        label="Choose Template"
                        placeholder="Choose one"
                        data={templates?.map((template) => ({
                            value: template.id,
                            label: template.name,
                        })) || []}
                        disabled={isLoadingTemplates || isErrorTemplates}
                        withAsterisk
                        value={formState.templateId}
                        onChange={(val) => setFormState({ ...formState, templateId: val || "" })}
                    />
                </Stack>
            </ModularModal>
        </Stack>
    );
}

export default WebsitePageClient;