import { ModularModal } from "@/app/(protected)/components/modal";
import { notify } from "@/app/components/notifications";
import { useClientApi } from "@/lib/hooks/client.api";
import {
    ActionIcon,
    Anchor,
    Avatar,
    Badge,
    Box,
    Card,
    CopyButton,
    Group,
    ScrollArea,
    Select,
    Stack,
    Text
} from "@mantine/core";
import { IconCheck, IconCopy, IconExternalLink, IconTrendingUp } from "@tabler/icons-react";
import { useState } from "react";

const GOOGLE_TRENDS_GEOS = [
    {
        group: "Popular", items: [
            { value: "ID", label: "Indonesia" },
            { value: "US", label: "United States" },
            { value: "GB", label: "United Kingdom" },
            { value: "IN", label: "India" },
            { value: "BR", label: "Brazil" },
            { value: "JP", label: "Japan" },
            { value: "KR", label: "South Korea" },
        ]
    },
    {
        group: "Asia Pacific", items: [
            { value: "AU", label: "Australia" },
            { value: "CN", label: "China" },
            { value: "HK", label: "Hong Kong" },
            { value: "MY", label: "Malaysia" },
            { value: "NZ", label: "New Zealand" },
            { value: "PH", label: "Philippines" },
            { value: "SG", label: "Singapore" },
            { value: "TW", label: "Taiwan" },
            { value: "TH", label: "Thailand" },
            { value: "VN", label: "Vietnam" },
        ]
    },
    {
        group: "Europe", items: [
            { value: "AT", label: "Austria" },
            { value: "BE", label: "Belgium" },
            { value: "FR", label: "France" },
            { value: "DE", label: "Germany" },
            { value: "IE", label: "Ireland" },
            { value: "IT", label: "Italy" },
            { value: "NL", label: "Netherlands" },
            { value: "PL", label: "Poland" },
            { value: "PT", label: "Portugal" },
            { value: "RU", label: "Russia" },
            { value: "ES", label: "Spain" },
            { value: "SE", label: "Sweden" },
            { value: "CH", label: "Switzerland" },
            { value: "TR", label: "Turkey" },
            { value: "UA", label: "Ukraine" },
        ]
    },
    {
        group: "Americas", items: [
            { value: "AR", label: "Argentina" },
            { value: "CA", label: "Canada" },
            { value: "CL", label: "Chile" },
            { value: "CO", label: "Colombia" },
            { value: "MX", label: "Mexico" },
            { value: "PE", label: "Peru" },
        ]
    },
    {
        group: "Middle East & Africa", items: [
            { value: "EG", label: "Egypt" },
            { value: "IL", label: "Israel" },
            { value: "NG", label: "Nigeria" },
            { value: "SA", label: "Saudi Arabia" },
            { value: "ZA", label: "South Africa" },
            { value: "AE", label: "United Arab Emirates" },
        ]
    }
];

interface TrendItem {
    title: string;
    traffic: string;
    pubDate: string;
    link: string;
    picture: string;
    news_source: string[];
    news_url: string[];
}

interface TrendResponse {
    success: boolean;
    geo: string;
    data: TrendItem[];
}

interface TrendsModalProps {
    opened: boolean;
    onClose: () => void;
    onSelectGeo?: (geo: string) => void;
}

const TrendsModal = ({ opened, onClose, onSelectGeo }: TrendsModalProps) => {
    const [selectedGeo, setSelectedGeo] = useState<string | null>("ID");
    const [trends, setTrends] = useState<TrendItem[]>([]);
    const api = useClientApi();

    const { mutate, isPending } = api.Mutate(
        `/api/trends`,
        { method: "POST" }, 
        {
            onSuccess: (data: TrendResponse) => {
                notify.success(`Found ${data.data.length} trending topics`);
                setTrends(data.data);
            },
            onError: () => {
                notify.error("Failed to fetch trends");
            },
        }
    );

    const handleChange = (value: string | null) => {
        setSelectedGeo(value);
        if (value && onSelectGeo) {
            onSelectGeo(value);
        }
    };

    const handleGetTrends = () => {
        if (selectedGeo) {
            mutate({ body: { geo: selectedGeo } });
        }
    };

    return (
        <ModularModal
            size="md"
            title="Trending Topics"
            opened={opened}
            onClose={onClose}
            cancelLabel="Close"
            submitLabel="Get Trends"
            onSubmit={handleGetTrends}
            isLoading={isPending}
        >
            <Stack gap="md">
                <Select
                    label="Region"
                    placeholder="Select country"
                    data={GOOGLE_TRENDS_GEOS}
                    value={selectedGeo}
                    onChange={handleChange}
                    searchable
                    nothingFoundMessage="Not found"
                    maxDropdownHeight={250}
                    allowDeselect={false}
                    disabled={isPending}
                    size="md" 
                />

                {trends.length > 0 && (
                    <ScrollArea h="60vh" offsetScrollbars type="scroll" pr="xs">
                        <Stack gap="sm">
                            {trends.map((item, index) => (
                                <Card key={index} withBorder padding="sm" radius="md">
                                    <Group wrap="nowrap" align="flex-start" gap="sm">
                                        
                                        <Avatar
                                            src={item.picture}
                                            radius="md"
                                            h={{ base: 60, sm: 80 }} 
                                            w={{ base: 60, sm: 80 }}
                                            style={{ flexShrink: 0 }} 
                                        />

                                        <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
                                            
                                            <Group justify="space-between" align="flex-start" wrap="nowrap" gap="xs">
                                                <Text 
                                                    fw={600} 
                                                    size="sm" 
                                                    lh={1.3} 
                                                    lineClamp={2}
                                                    style={{ flex: 1 }}
                                                >
                                                    {item.title}
                                                </Text>
                                                
                                                <CopyButton value={item.title} timeout={2000}>
                                                    {({ copied, copy }) => (
                                                        <ActionIcon 
                                                            color={copied ? 'teal' : 'gray'} 
                                                            variant="subtle" 
                                                            onClick={copy}
                                                            size="md" 
                                                        >
                                                            {copied ? <IconCheck size={18} /> : <IconCopy size={18} />}
                                                        </ActionIcon>
                                                    )}
                                                </CopyButton>
                                            </Group>

                                            <Group gap={6} wrap="wrap">
                                                <Badge
                                                    size="sm"
                                                    variant="light"
                                                    color="green"
                                                    radius="sm"
                                                    leftSection={<IconTrendingUp size={12} />}
                                                >
                                                    {item.traffic}
                                                </Badge>
                                                <Text size="xs" c="dimmed">
                                                    {new Date(item.pubDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                </Text>
                                            </Group>

                                            {item.news_url && item.news_url.length > 0 && (
                                                <Box mt={2}>
                                                    <Anchor
                                                        href={item.news_url[0]}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        underline="hover"
                                                        size="xs"
                                                        fw={500}
                                                        c="blue"
                                                        style={{ 
                                                            display: 'inline-flex', 
                                                            alignItems: 'center', 
                                                            gap: 4,
                                                            maxWidth: '100%' 
                                                        }}
                                                    >
                                                        <Text span truncate="end" style={{ maxWidth: '180px' }}>
                                                            {item.news_source[0] || "Read News"}
                                                        </Text>
                                                        <IconExternalLink size={12} style={{ flexShrink: 0 }} />
                                                    </Anchor>
                                                </Box>
                                            )}
                                        </Stack>
                                    </Group>
                                </Card>
                            ))}
                        </Stack>
                    </ScrollArea>
                )}

                {trends.length === 0 && !isPending && (
                    <Stack align="center" justify="center" h={200} bg="var(--mantine-color-gray-0)" style={{ borderRadius: 8 }}>
                        <IconTrendingUp size={32} color="gray" style={{ opacity: 0.5 }} />
                        <Text size="sm" c="dimmed" ta="center">
                            Select a region to see trends
                        </Text>
                    </Stack>
                )}
            </Stack>
        </ModularModal>
    );
}

export default TrendsModal;