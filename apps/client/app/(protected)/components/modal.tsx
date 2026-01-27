'use client';

import { 
    Modal, 
    Stack, 
    Title, 
    Text, 
    Group, 
    Button, 
    Box, 
    rem, 
    ScrollArea 
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { ReactNode } from "react";

interface ModularModalProps {
    opened: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    children: ReactNode;
    submitLabel?: string;
    cancelLabel?: string;
    onSubmit?: () => void;
    isLoading?: boolean;
    size?: string | number;
    withFooter?: boolean;
}

export function ModularModal({
    opened,
    onClose,
    title,
    description,
    children,
    submitLabel = "Save Changes",
    cancelLabel = "Cancel",
    onSubmit,
    isLoading = false,
    size = "md",
    withFooter = true
}: ModularModalProps) {
    const isMobile = useMediaQuery('(max-width: 50em)');

    return (
        <Modal 
            opened={opened} 
            onClose={onClose} 
            title={null}
            size={size}
            padding={0}
            radius={isMobile ? 0 : "md"}
            centered={true}
            styles={{
                header: { display: 'none' }, 
                body: { display: 'flex', flexDirection: 'column', height: 'auto', maxHeight: isMobile ? '100vh' : '85vh' }
            }}
            transitionProps={{ transition: 'pop', duration: 200 }}
        >
            <Box p="lg" pb="sm" style={{ borderBottom: '1px solid var(--mantine-color-gray-2)' }}>
                <Title order={3} size="h3">{title}</Title>
                {description && (
                    <Text c="dimmed" size="sm" mt={4}>
                        {description}
                    </Text>
                )}
            </Box>

            <ScrollArea.Autosize type="scroll" style={{ flex: 1 }}>
                <Box p="lg">
                    {children}
                </Box>
            </ScrollArea.Autosize>

            {withFooter && (
                <Box 
                    p="md" 
                    style={{ 
                        borderTop: '1px solid var(--mantine-color-gray-2)',
                        backgroundColor: 'var(--mantine-color-body)' 
                    }}
                >
                    <Group justify="flex-end" gap="sm">
                        <Button variant="default" onClick={onClose} disabled={isLoading}>
                            {cancelLabel}
                        </Button>
                        <Button onClick={onSubmit} loading={isLoading}>
                            {submitLabel}
                        </Button>
                    </Group>
                </Box>
            )}
        </Modal>
    );
}