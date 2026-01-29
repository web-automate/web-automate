'use client';

import { Box, Group, Paper, Select, Stack, Text } from "@mantine/core";
import type { WebsiteStatus } from "@repo/database";
import { IconCircleCheck, IconFileDescription, IconSettingsAutomation, IconTools } from "@tabler/icons-react";

interface StatusWebsiteFormProps {
    websiteId: string;
    onStatusChange: (status: WebsiteStatus) => void;
    isPending: boolean;
    currentStatus?: WebsiteStatus;
}

interface StatusOption {
    value: WebsiteStatus;
    label: string;
    description: string;
}

export const StatusWebsiteForm = ({ 
    onStatusChange, 
    isPending, 
    currentStatus 
}: StatusWebsiteFormProps) => {

    const statusData: StatusOption[] = [
        { value: "DRAFT", label: 'Draft', description: 'Website belum dipublikasikan' },
        { value: "READY", label: 'Ready', description: 'Siap untuk dideploy' },
        { value: "PUBLISHED", label: 'Published', description: 'Website aktif dan dapat diakses' },
        { value: "MAINTENANCE", label: 'Maintenance', description: 'Mode perbaikan' },
    ];

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PUBLISHED': return <IconCircleCheck size={18} color="var(--mantine-color-green-6)" />;
            case 'MAINTENANCE': return <IconTools size={18} color="var(--mantine-color-orange-6)" />;
            case 'DRAFT': return <IconFileDescription size={18} color="var(--mantine-color-gray-6)" />;
            default: return <IconSettingsAutomation size={18} color="var(--mantine-color-blue-6)" />;
        }
    };

    return (
        <Paper withBorder p="md" radius="md">
            <Stack gap="sm">
                <Group justify="space-between">
                    <Box>
                        <Text fw={600} size="sm">Website Status</Text>
                        <Text size="xs" c="dimmed">Ubah visibilitas dan kondisi operasional website Anda.</Text>
                    </Box>
                </Group>

                <Select
                    placeholder="Pilih Status"
                    data={statusData}
                    defaultValue={currentStatus}
                    value={currentStatus}
                    disabled={isPending}
                    leftSection={getStatusIcon(currentStatus || '')}
                    onChange={(value) => value && onStatusChange(value as WebsiteStatus)}
                    allowDeselect={false}
                    comboboxProps={{ transitionProps: { transition: 'pop-top-left', duration: 200 } }}
                    styles={{
                        input: {
                            fontWeight: 500
                        }
                    }}
                />
            </Stack>
        </Paper>
    );
};