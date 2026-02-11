'use client';

import { ActionIcon, Box, Container, Group, Stack } from "@mantine/core";
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
            description: "Manage website configurations.",
        },
        articles: {
            title: "Articles",
            description: "Manage blog posts.",
        },
        pages: {
            title: "Pages",
            description: "Manage static pages.",
        },
        authors: {
            title: "Authors",
            description: "Manage authors list.",
        },
        seo: {
            title: "SEO",
            description: "Search engine optimization.",
        },
        logs: {
            title: "Logs",
            description: "View activity logs.",
        },
        settings: {
            title: "Settings",
            description: "General settings.",
        }
    };

    const activeSegment = pathname.split('/').pop() || 'details';
    const currentHeader = headerConfig[activeSegment] || headerConfig.details;

    return (
        <Container size="md" p={0}>
            <Stack gap="lg">
                <Group wrap="nowrap" align="center" justify="space-between" style={{ borderBottom: '1px solid #e5e5e5' }} pb="md">
                    <Group wrap="nowrap" align="center" gap="sm">
                        <ActionIcon
                            variant="light"
                            color="orange"
                            size="lg"
                            radius="md"
                            onClick={() => push(`/websites`)}
                            aria-label="Back to websites"
                        >
                            <IconArrowLeft size={20} />
                        </ActionIcon>

                        <Box >
                            <PageHeader
                                title={currentHeader.title}
                                description={currentHeader.description}
                                icon={currentHeader.icon}
                                breadcrumbs={currentHeader.breadcrumbs}
                            />
                        </Box>
                    </Group>

                    <Box>
                        <WebsiteNavigation />
                    </Box>
                </Group>

                <Box>
                    {children}
                </Box>
            </Stack>
        </Container>
    );
}