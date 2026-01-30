import { notify } from "@/app/components/notifications";
import { useClientApi } from "@/lib/hooks/client.api";
import { ActionIcon, Box, Flex, Group, Radio, Stack, Text, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import type { AiConfiguration } from "@repo/database";
import { IconCheck, IconEdit, IconTrash } from "@tabler/icons-react";
import { AiConfigurationCreateInput } from "../../../../../../packages/database/generated/prisma/models";
import { ModularModal } from "../../components/modal";

interface AiListModalProps {
    aiConfig?: AiConfiguration[];
    opened: boolean;
    onClose: () => void;
}

const AiListModal = ({ aiConfig, opened, onClose }: AiListModalProps) => {
    const api = useClientApi();

    const formData = useForm<AiConfigurationCreateInput>({
        initialValues: {
            apiKey: "",
            baseUrl: null,
            provider: "",
            isActive: false,
        }
    })

    const { mutate: setActiveMutate } = api.Mutate(
        "/api/settings/ai/{id}/setActive",
        { method: "PATCH" },
        {
            onSuccess: () => {
                notify.success("Active configuration updated successfully");
            },
            onError: () => {
                notify.error("Failed to update active configuration");
            },
            invalidateKeys: [['ai-config']]
        }
    )
    const { mutate: AIMutate } = api.Mutate(
        "/api/settings/ai/{id}",
        { method: undefined },
        {
            onSuccess: () => {
                notify.success("Configuration deleted successfully");
            },
            onError: () => {
                notify.error("Failed to delete configuration");
            },
            invalidateKeys: [['ai-config']]
        }
    )

    const setActive = (id: string) => {
        if (!aiConfig) return;
        setActiveMutate({
            id,
        })
    };
    const handleDelete = (id: string) => {
        if (!aiConfig) return;
        AIMutate({
            id,
            method: "DELETE",
        })
    };
    const handleEdit = (id: string) => {
        if (!aiConfig) return;
        AIMutate({
            id,
            method: "PATCH",
            body: {
                ...formData.values,
            }
        })
    };

    return (
        <ModularModal
            opened={opened}
            onClose={onClose}
            title="AI Integrations"
            description="Manage and configure your AI provider connections"
            withSubmitButton={false}
            cancelLabel="Close"
        >
            <Stack gap={0} mah={500} style={{ overflowY: "auto" }}>
                {aiConfig?.map((item) => (
                    <Flex
                        key={item.id}
                        p="md"
                        justify="space-between"
                        align="center"
                        style={(theme) => ({
                            borderBottom: `1px solid ${theme.colors.gray[2]}`,
                            '&:lastChild': { borderBottom: 0 }
                        })}
                    >
                        <Group gap="sm">
                            <Radio
                                size="xs"
                                value={item.id}
                                checked={item.isActive}
                                onChange={() => setActive(item.id)}
                                styles={{ radio: { cursor: 'pointer' } }}
                            />
                            <div>
                                <Group gap="xs" align="center">
                                    <Text fw={600} size="sm">{item.provider}</Text>
                                    <Box
                                        w={6}
                                        h={6}
                                        style={{
                                            borderRadius: '50%',
                                            backgroundColor: item.isActive ? 'var(--mantine-color-green-filled)' : 'var(--mantine-color-gray-4)'
                                        }}
                                    />
                                </Group>
                                {formData.values.id === item.id ? (
                                    <TextInput
                                        size="xs"
                                        {...formData.getInputProps(`apiKey`)}
                                    />

                                ) : (
                                    <Text size="xs" c="dimmed" ff="monospace">
                                        {item.apiKey ? `${item.apiKey.slice(0, 8)}••••••••` : 'No key provided'}
                                    </Text>
                                )}
                            </div>
                        </Group>

                        <Group gap={5}>
                            {formData.values.id === item.id ? (
                                <ActionIcon
                                    variant="subtle"
                                    color="green"
                                    onClick={() => {
                                        handleEdit(item.id)
                                        formData.reset()
                                    }}
                                    title="Save configuration"
                                >
                                    <IconCheck size={16} stroke={1.5} />
                                </ActionIcon>
                            ) : (
                                <ActionIcon
                                    variant="subtle"
                                    color="gray"
                                    onClick={() => {
                                        formData.setValues(item)
                                    }}
                                    title="Edit configuration"
                                >
                                    <IconEdit size={16} stroke={1.5} />
                                </ActionIcon>
                            )}

                            <ActionIcon
                                variant="subtle"
                                color="red"
                                onClick={() => {
                                    handleDelete(item.id)
                                }}
                                title="Delete provider"
                            >
                                <IconTrash size={16} stroke={1.5} />
                            </ActionIcon>
                        </Group>
                    </Flex>
                ))}
            </Stack>
        </ModularModal>
    );
};

export default AiListModal;