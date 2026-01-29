'use client';

import { useClientApi } from "@/lib/hooks/client.api";
import {
    Badge,
    Box,
    Center,
    Code,
    Divider,
    Group,
    Loader,
    Paper,
    ScrollArea,
    Stack,
    Text
} from "@mantine/core";
import type { WebsiteLog } from "@repo/database";
import { IconCircleCheck, IconCircleX, IconLoader2, IconTerminal2 } from "@tabler/icons-react";
import dayjs from "dayjs";

const LogsClientPage = ({ websiteId }: { websiteId: string }) => {
    const api = useClientApi();
    
    const { data: logs, isLoading } = api.Get<WebsiteLog[]>(
        `/api/websites/${websiteId}/logs`, 
        ['logs', websiteId],
    );

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'SUCCESS': return <IconCircleCheck size={16} color="var(--mantine-color-green-6)" />;
            case 'FAILED': return <IconCircleX size={16} color="var(--mantine-color-red-6)" />;
            case 'BUILDING': return <IconLoader2 size={16} className="animate-spin" color="var(--mantine-color-blue-6)" />;
            default: return <IconTerminal2 size={16} color="var(--mantine-color-gray-6)" />;
        }
    };

    if (isLoading) return <Center mih={200}><Loader size="sm" /></Center>;

    return (
        <Stack gap="md">
            <Group justify="space-between">
                <Group gap="xs">
                    <IconTerminal2 size={20} />
                    <Text fw={600}>Activity Logs</Text>
                </Group>
                <Badge variant="dot" color={logs?.[0]?.status === 'SUCCESS' ? 'green' : 'blue'}>
                    Live Update
                </Badge>
            </Group>

            <Paper withBorder radius="md" bg="gray.9" p={0} style={{ overflow: 'hidden' }}>
                <ScrollArea h={400} offsetScrollbars scrollbars="y">
                    <Stack gap={0} p="md">
                        {logs && logs.length > 0 ? (
                            logs.map((log, index) => (
                                <Box key={log.id} mb={index === 0 ? 0 : 8}>
                                    <Group align="flex-start" wrap="nowrap" gap="sm">
                                        <Text ff="monospace" size="xs" c="dimmed" style={{ whiteSpace: 'nowrap' }}>
                                            [{dayjs(log.createdAt).format('HH:mm:ss')}]
                                        </Text>
                                        
                                        <Box style={{ flex: 1 }}>
                                            <Group gap={6} align="center">
                                                {getStatusIcon(log.status)}
                                                <Text size="sm" c="gray.0" fw={500} style={{ fontFamily: 'monospace' }}>
                                                    {log.message}
                                                </Text>
                                            </Group>
                                            
                                            {log.details && (
                                                <Code block color="gray.8" c="gray.4" mt={4} fz="xs">
                                                    {log.details}
                                                </Code>
                                            )}
                                        </Box>
                                    </Group>
                                    {index !== logs.length - 1 && <Divider my="xs" color="gray.8" variant="dashed" />}
                                </Box>
                            ))
                        ) : (
                            <Center h={100}>
                                <Text size="sm" c="dimmed">No logs available for this website.</Text>
                            </Center>
                        )}
                    </Stack>
                </ScrollArea>
            </Paper>
            
            <Text size="xs" c="dimmed" ta="center">
                Logs are kept for the last 50 build activities.
            </Text>
        </Stack>
    );
};

export default LogsClientPage;