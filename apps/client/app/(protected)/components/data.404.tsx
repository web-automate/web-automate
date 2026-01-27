import { 
    Text, 
    Title, 
    Stack, 
    ThemeIcon, 
    rem, 
    Box,
    Center
} from "@mantine/core";
import { IconSearchOff, IconDatabaseOff } from "@tabler/icons-react";
import { ReactNode } from "react";

interface NotFoundDataProps {
    title?: string;
    description?: string;
    icon?: ReactNode;
    action?: ReactNode;
    minHeight?: number | string; 
}

const NotFoundData = ({ 
    title = "Data Tidak Ditemukan", 
    description = "Belum ada data yang tersedia untuk ditampilkan saat ini.",
    icon,
    action,
    minHeight = 300
}: NotFoundDataProps) => {
    return (
        <Center h={minHeight}>
            <Stack align="center" gap="sm" style={{ maxWidth: 400 }}>
                <ThemeIcon 
                    size={80} 
                    radius="50%" 
                    variant="light" 
                    color="gray"
                    mb="xs"
                    style={{ border: '1px dashed var(--mantine-color-gray-4)' }}
                >
                    {icon || <IconSearchOff style={{ width: rem(40), height: rem(40) }} stroke={1.5} />}
                </ThemeIcon>

                <Title order={3} ta="center" size="h4" fw={700}>
                    {title}
                </Title>
                
                <Text c="dimmed" ta="center" size="sm" style={{ lineHeight: 1.6 }}>
                    {description}
                </Text>

                {action && (
                    <Box mt="md">
                        {action}
                    </Box>
                )}
            </Stack>
        </Center>
    )
}

export default NotFoundData;