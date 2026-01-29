'use client';

import { notify } from "@/app/components/notifications";
import {
    ActionIcon,
    Alert, Box, Button,
    Code,
    Divider,
    Group,
    Select,
    Stack,
    Text,
    TextInput,
    Tooltip
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useClipboard } from "@mantine/hooks";
import { IconAlertCircle, IconCheck, IconCopy, IconInfoCircle } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { ModularModal } from "../../components/modal";

interface AddWebsiteModalProps {
    ipServer?: string;
    opened: boolean;
    onClose: () => void;
    templates: any[];
    isLoadingTemplates: boolean;
    onSubmit: (values: any) => void;
    isCreating: boolean;
}

export function AddWebsiteModal({
    ipServer,
    opened,
    onClose,
    templates,
    isLoadingTemplates,
    onSubmit,
    isCreating
}: AddWebsiteModalProps) {
    const targetIp = ipServer;
    const clipboard = useClipboard({ timeout: 2000 });
    const [verifyStatus, setVerifyStatus] = useState<'idle' | 'loading' | 'success' | 'failed'>('idle');

    const form = useForm({
        initialValues: { name: "", domain: "", templateId: "", language: "id", type: "INIT_WEBSITE" },
        validateInputOnChange: true,
        validate: {
            name: (value) => (!value ? 'Website name is required' : null),
            domain: (value) => (!value ? 'Domain is required' : null),
            templateId: (value) => (!value ? 'Template is required' : null),
            language: (value) => (!value ? 'Language is required' : null),
        },
    });

    useEffect(() => {
        setVerifyStatus('idle');
    }, [form.values.domain]);

    const handleVerify = async () => {
        const domainError = form.validateField('domain');
        if (domainError.hasError) return;

        setVerifyStatus('loading');
        try {
            const res = await fetch("/api/websites/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ domain: form.values.domain })
            });
            const data = await res.json();

            if (data.success) {
                setVerifyStatus('success');
                notify.success(data.message);
            } else {
                setVerifyStatus('failed');
                notify.error(data.message);
            }
        } catch (e) {
            setVerifyStatus('failed');
            notify.error("Verification failed");
        }
    };

    const isFormValid = form.isValid();
    const allFieldsFilled = !!form.values.name && !!form.values.domain && !!form.values.templateId;
    const isDisabled = !isFormValid || !allFieldsFilled || verifyStatus !== 'success';

    return (
        <ModularModal
            opened={opened}
            onClose={onClose}
            title="Create New Website"
            submitLabel="Create Website"
            onSubmit={form.onSubmit((values) => onSubmit(values))}
            isLoading={isCreating}
            isDisabled={isDisabled}
            size="md"
        >
            <Stack gap="md">
                <TextInput
                    label="Website Name"
                    placeholder="My Awesome Site"
                    required
                    {...form.getInputProps('name')}
                />

                <Select
                    data={[
                        { value: "id", label: "Bahasa Indonesia" },
                        { value: "en", label: "English" },
                    ]}
                    label="Language"
                    placeholder="Select language"
                    required
                    {...form.getInputProps('language')}
                />

                <Stack gap={4}>
                    <TextInput
                        label="Domain / Subdomain"
                        placeholder="example.com"
                        required
                        {...form.getInputProps('domain')}
                        rightSectionWidth={90}
                        rightSection={
                            <Button
                                size="compact-xs"
                                variant="light"
                                color={verifyStatus === 'success' ? 'green' : 'blue'}
                                onClick={handleVerify}
                                loading={verifyStatus === 'loading'}
                                disabled={!!form.errors.domain || !form.values.domain}
                            >
                                {verifyStatus === 'success' ? 'Verified' : 'Verify'}
                            </Button>
                        }
                    />

                    <Alert variant="light" color="blue" title="DNS Configuration" icon={<IconInfoCircle />}>
                        <Stack gap="xs">
                            <Text size="xs">
                                Point your domain <b>A Record</b> to our server IP:
                            </Text>

                            <Group gap="xs">
                                <Group gap={0} style={{ overflow: 'hidden' }}>
                                    <Code fw={700} fz="sm" px={8} py={3} bg="gray.0.5">
                                        {targetIp}
                                    </Code>
                                    <Tooltip label={clipboard.copied ? "Copied" : "Copy IP"}>
                                        <ActionIcon
                                            variant="light"
                                            color={clipboard.copied ? "green" : "blue"}
                                            onClick={() => clipboard.copy(targetIp)}
                                            radius={0}
                                            size="md"
                                        >
                                            {clipboard.copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                                        </ActionIcon>
                                    </Tooltip>
                                </Group>
                                <Text size="xs">with Name: <Code>@</Code> or <Code>subdomain</Code></Text>
                            </Group>

                            <Divider variant="dashed" />

                            <Box>
                                <Text size="xs" fw={700} c="orange.8">
                                    ⚠️ IMPORTANT: Disable Cloudflare Proxy (Orange Cloud)
                                </Text>
                                <Text size="xs" c="dimmed" mt={2}>
                                    Set status to <b>"DNS Only"</b> (Grey Cloud) until verification is successful.
                                </Text>
                            </Box>
                        </Stack>
                    </Alert>

                    {verifyStatus === 'failed' && (
                        <Group gap={4} mt={5}>
                            <IconAlertCircle size={14} color="var(--mantine-color-red-6)" />
                            <Text size="xs" c="red" fw={500}>
                                Verification failed. DNS changes may take some time to propagate.
                            </Text>
                        </Group>
                    )}

                    {verifyStatus === 'success' && (
                        <Group gap={4} mt={5}>
                            <IconCheck size={14} color="var(--mantine-color-green-6)" />
                            <Text size="xs" c="green" fw={500}>
                                Domain is pointing correctly!
                            </Text>
                        </Group>
                    )}
                </Stack>

                <Select
                    label="Choose Template"
                    placeholder="Select a style"
                    data={templates?.map(t => ({ value: t.id, label: t.name })) || []}
                    disabled={isLoadingTemplates}
                    required
                    {...form.getInputProps('templateId')}
                />
            </Stack>
        </ModularModal>
    );
}