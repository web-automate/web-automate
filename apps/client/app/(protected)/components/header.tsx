'use client';

import { 
    Title, 
    Text, 
    Group, 
    Stack, 
    Box, 
    Breadcrumbs, 
    Anchor,
    ThemeIcon,
    rem
} from "@mantine/core";
import { ReactNode } from "react";
import { IconChevronRight } from "@tabler/icons-react";

interface BreadcrumbItem {
    title: string;
    href: string;
}

interface PageHeaderProps {
    title: string;
    description?: string;
    icon?: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
    action?: ReactNode;
}

export function PageHeader({ 
    title, 
    description, 
    icon,
    breadcrumbs, 
    action 
}: PageHeaderProps) {
    return (
        <Box mb="xl">
            {breadcrumbs && (
                <Breadcrumbs 
                    separator={<IconChevronRight size={14} color="gray" />} 
                    mb="xs"
                    styles={{
                        breadcrumb: { fontSize: rem(12), fontWeight: 500 }
                    }}
                >
                    {breadcrumbs.map((item, index) => (
                        <Anchor key={index} href={item.href} c="dimmed" underline="never">
                            {item.title}
                        </Anchor>
                    ))}
                </Breadcrumbs>
            )}

            <Group justify="space-between" align="flex-start" wrap="wrap" gap="md">
                <Group align="flex-start" gap="md" style={{ flex: 1 }}>
                    {icon && (
                        <ThemeIcon 
                            size={48} 
                            radius="md" 
                            variant="light" 
                            color="blue"
                            style={{ flexShrink: 0 }}
                        >
                            {icon}
                        </ThemeIcon>
                    )}
                    
                    <Stack gap={2} style={{ maxWidth: '600px' }}>
                        <Title order={2} style={{ lineHeight: 1.2 }}>
                            {title}
                        </Title>
                        {description && (
                            <Text c="dimmed" size="sm">
                                {description}
                            </Text>
                        )}
                    </Stack>
                </Group>

                {action && (
                    <Box style={{ flexShrink: 0 }}>
                        {action}
                    </Box>
                )}
            </Group>
        </Box>
    );
}