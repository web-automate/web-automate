'use client';

import { Box, Flex, Stack, ThemeIcon } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { usePathname, useRouter } from "next/navigation";
import { PageHeader } from "../../components/header";
import { WebsiteNavigation } from "./components/website.nav";

export default function WebsiteLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const { push } = useRouter();

    const headerConfig: Record<string, any> = {
        details: {
            title: "Website Details",
            description: "Manage your website basic information and configurations.",
        },
        articles: {
            title: "Articles Management",
            description: "Create, edit, and organize your website blog posts.",
        },
        pages: {
            title: "Static Pages",
            description: "Manage your static pages like About, Contact, and Privacy Policy.",
        }
    };

    const activeSegment = pathname.split('/').pop() || 'details';
    const currentHeader = headerConfig[activeSegment] || headerConfig.details;

    return (
        <Stack gap={0} pb={120}>
            <Flex gap={"xs"}>
                <ThemeIcon
                    size={48}
                    radius="md"
                    variant="light"
                    color="orange.5"
                    style={{ flexShrink: 0, cursor: 'pointer' }}
                    onClick={() => push(`/websites`)}
                >
                    <IconArrowLeft size={30} />
                </ThemeIcon>
                <PageHeader
                    title={currentHeader.title}
                    description={currentHeader.description}
                    icon={currentHeader.icon}
                    breadcrumbs={currentHeader.breadcrumbs}
                />
            </Flex>

            <Stack gap="md">
                <WebsiteNavigation />
                <Box pt="md">
                    {children}
                </Box>
            </Stack>
        </Stack>
    );
}