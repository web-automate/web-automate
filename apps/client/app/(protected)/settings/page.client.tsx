'use client';

import { notify } from "@/app/components/notifications";
import { authClient } from "@/lib/auth.client";
import { AiProvider } from "@/lib/const/ai.provider";
import { useClientApi } from "@/lib/hooks/client.api";
import {
    ActionIcon,
    Badge,
    Box,
    Button,
    Container,
    Divider,
    Group,
    Paper,
    rem,
    Select,
    Stack,
    Text,
    TextInput,
    Title
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { AiConfiguration } from "@repo/database";
import {
    IconBrandGoogle,
    IconBrandOpenai,
    IconDeviceFloppy,
    IconKey,
    IconLogout,
    IconRobot
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { ReactNode, useState } from "react";
import AiListModal from "./components/ai-list.modal";

const SettingsPageClient = ({ aiConfig }: { aiConfig?: AiConfiguration[] }) => {
    const { push } = useRouter();
    const api = useClientApi();
    const [isSignoutingOut, setIsSignoutingOut] = useState(false);
    const [isAiListModalOpened, { open: openAiListModal, close: closeAiListModal }] = useDisclosure(false);

    const { data: aiConfigs, isLoading } = api.Get<AiConfiguration[]>(
        `/api/settings/ai`,
        ['ai-config'],
        {
            initialData: aiConfig,
        },
    );

    const form = useForm({
        initialValues: {
            provider: aiConfig?.[0]?.provider || 'google',
            apiKey: '',
            baseUrl: '',
        },
        validate: {
            apiKey: (value) => (value.length < 5 ? 'API Key is too short' : null),
            provider: (value) => (!value ? 'Select a provider' : null),
        },
    });

    const { mutate: saveKey, isPending: isSaving } = api.Mutate(
        "/api/settings/ai",
        { method: "POST" },
        {
            onSuccess: () => {
                notify.success("Key saved successfully");
                form.reset()
            },
            onError: () => {
                notify.error("Failed to save key");
            },
            invalidateKeys: [['ai-config']],
        }
    );

    const handleSignOut = async () => {
        setIsSignoutingOut(true);
        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => push("/auth"),
                onError: () => notify.error("Failed to sign out, please try again or contact support"),
            }
        });
        setIsSignoutingOut(false);
    };

    const handleSubmit = async (values: typeof form.values) => {
        saveKey({
            body: values,
        });
    }

    return (
        <Container size="sm" pb="xl">
            <Stack gap="xl">
                <Group justify="space-between" align="flex-end">
                    <Box>
                        <Title order={2} fw={700}>Settings</Title>
                        <Text c="dimmed" size="sm">Manage your AI configurations and account</Text>
                    </Box>
                    <ActionIcon
                        variant="light"
                        color="red"
                        onClick={handleSignOut}
                        loading={isSignoutingOut}
                        title="Logout"
                    >
                        <IconLogout style={{ width: rem(18), height: rem(18) }} />
                    </ActionIcon>
                </Group>

                <Paper withBorder p="md" radius="md" shadow="sm">
                    <Group mb="md">
                        <IconRobot size={22} color="var(--mantine-color-blue-filled)" />
                        <Title order={4}>AI Providers</Title>
                    </Group>

                    <Text component="div" size="xs" c="dimmed" mb="lg">
                        Configure your LLM providers. These keys are used for content generation and research. <Badge variant="light" size="xs" color="blue">One API key for each provider</Badge>
                    </Text>

                    <form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
                        <Stack gap="sm">
                            <Select
                                label="Provider"
                                placeholder="Choose AI Service"
                                data={Object.values(AiProvider).map(v => ({ value: v, label: v.toUpperCase() }))}
                                required
                                {...form.getInputProps('provider')}
                            />

                            <TextInput
                                label="API Key"
                                placeholder="sk-..."
                                type="password"
                                leftSection={<IconKey size={16} />}
                                required
                                {...form.getInputProps('apiKey')}
                            />

                            <TextInput
                                label="Base URL (Optional)"
                                placeholder="https://api.anthropic.com"
                                description="Leave empty for default"
                                {...form.getInputProps('baseUrl')}
                            />

                            <Button
                                mt="sm"
                                leftSection={<IconDeviceFloppy size={18} />}
                                fullWidth
                                loading={isSaving}
                                type="submit"
                            >
                                Save Configuration
                            </Button>
                        </Stack>
                    </form>
                </Paper>

                <Paper withBorder radius="md">
                    <Box p="md">
                        <Group justify="space-between" align="center" mb={2}>
                            <Text fw={600} size="sm" mb="xs">Active Integrations</Text>
                            <Button onClick={openAiListModal} variant="subtle" size="compact-xs">See More</Button>
                        </Group>
                        <Stack gap="xs">
                            {
                                isLoading ? (
                                    <Text size="sm" c="dimmed">Loading integrations...</Text>
                                ) : aiConfigs && aiConfigs.length > 0 ? (
                                    aiConfigs.filter(config => config.isActive).map((config) => (
                                        <Group justify="space-between" p="xs" style={{ border: '1px solid var(--mantine-color-gray-2)', borderRadius: '8px' }} key={config.id}>
                                            <Group gap="sm">
                                                <IconProvider provider={config.provider} isActive={config.isActive} />
                                                <Text size="sm" fw={500}>{config.provider.toUpperCase()}</Text>
                                            </Group>
                                            <Badge color={config.isActive ? 'green' : 'red'} variant="light">{config.isActive ? 'Active' : 'Inactive'}</Badge>
                                        </Group>
                                    ))
                                ) : (
                                    <Text size="sm" c="dimmed">No active integrations</Text>
                                )
                            }
                        </Stack>
                    </Box>
                </Paper>

                <AiListModal aiConfig={aiConfigs} opened={isAiListModalOpened} onClose={closeAiListModal} />

                <Divider label="Danger Zone" labelPosition="center" color="red" />

                <Button
                    variant="outline"
                    color="red"
                    fullWidth
                    leftSection={<IconLogout size={18} />}
                    onClick={handleSignOut}
                    loading={isSignoutingOut}
                >
                    Sign Out from Account
                </Button>
            </Stack>
        </Container>
    );
}

const IconProvider = ({ provider, isActive }: { provider: string; isActive: boolean }) => {
    const color = isActive ? 'var(--mantine-color-green-filled)' : 'var(--mantine-color-gray-5)';

    const iconMap: Record<string, ReactNode> = {
        [AiProvider.ANTHROPIC]: <IconRobot size={20} color={color} />,
        [AiProvider.GOOGLE]: <IconBrandGoogle size={20} color={color} />,
        [AiProvider.OPENAI]: <IconBrandOpenai size={20} color={color} />,
    };

    return <>{iconMap[provider] || <IconRobot size={20} color={color} />}</>;
};

export default SettingsPageClient;