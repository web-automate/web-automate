'use client';

import {
  Box,
  Button,
  Card,
  Container,
  Group,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
  rem
} from "@mantine/core";
import { IconBolt, IconChartDots, IconRocket, IconWand } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

const features = [
  {
    icon: IconBolt,
    title: 'Fast Performance',
    description: 'Optimized for speed. No more waiting for your dashboard to load.'
  },
  {
    icon: IconWand,
    title: 'AI Automation',
    description: 'Let our AI handle the boring stuff while you focus on creativity.'
  },
  {
    icon: IconChartDots,
    title: 'Real-time Analytics',
    description: 'Track your content performance instantly with detailed insights.'
  },
];

const LandingPageClient = () => {
  const { push } = useRouter();

  return (
    <Box>
      <Box component="header" py="md" style={{ borderBottom: '1px solid var(--mantine-color-gray-2)' }}>
        <Container size="lg">
          <Group justify="space-between">
            <Group gap="xs">
              <ThemeIcon variant="gradient" gradient={{ from: 'blue', to: 'cyan' }} radius="md" size="lg">
                <IconRocket size={20} />
              </ThemeIcon>
              <Text fw={700} size="lg" style={{ letterSpacing: -0.5 }}>
                Automate
              </Text>
            </Group>
            <Button variant="subtle" color="gray" onClick={() => push("/auth")}>
              Login
            </Button>
          </Group>
        </Container>
      </Box>

      <Container size="lg" py={{ base: 60, md: 100 }}>
        <Stack align="center" gap="xl" ta="center">
          <Box>
            <BadgeComponent text="v1.0 is Live" />
            <Title
              order={1}
              style={{
                fontSize: rem(42),
                fontWeight: 900,
                lineHeight: 1.1,
                letterSpacing: -1,
              }}
              mt="sm"
            >
              Automate your <br />
              <Text component="span" variant="gradient" gradient={{ from: 'blue', to: 'cyan' }} inherit>
                Digital Presence
              </Text>
            </Title>
          </Box>

          <Text c="dimmed" size="lg" maw={600} mx="auto">
            The modern CMS dashboard designed for speed and simplicity. 
            Manage your content, analyze traffic, and automate workflows in one place.
          </Text>

          <Group gap="md">
            <Button
              size="lg"
              radius="xl"
              variant="gradient"
              gradient={{ from: 'blue', to: 'cyan' }}
              onClick={() => push("/auth")}
            >
              Get Started
            </Button>
            <Button
              size="lg"
              radius="xl"
              variant="default"
              onClick={() => push("#")} // Contoh link lain
            >
              Learn more
            </Button>
          </Group>
        </Stack>
      </Container>

      <Box bg="gray.0" py={{ base: 60, md: 100 }}>
        <Container size="lg">
            <Stack gap="xl">
                <Box ta="center" mb="xl">
                    <Text c="blue" fw={700} tt="uppercase" size="sm">Features</Text>
                    <Title order={2} mt="xs">Why choose Automate?</Title>
                </Box>

                <SimpleGrid cols={1} spacing="xl">
                    {features.map((feature, index) => (
                    <Card key={index} padding="xl" radius="md" withBorder>
                        <ThemeIcon
                            size={50}
                            radius="md"
                            variant="light"
                            color="blue"
                            mb="md"
                        >
                        <feature.icon size={26} stroke={1.5} />
                        </ThemeIcon>
                        <Text fw={700} size="lg" mb="xs">
                        {feature.title}
                        </Text>
                        <Text c="dimmed" size="sm">
                        {feature.description}
                        </Text>
                    </Card>
                    ))}
                </SimpleGrid>
            </Stack>
        </Container>
      </Box>

      <Box component="footer" py="xl" ta="center">
        <Text c="dimmed" size="sm">
          © {new Date().getFullYear()} Automate CMS. All rights reserved.
        </Text>
      </Box>
    </Box>
  );
}

const BadgeComponent = ({ text }: { text: string }) => (
  <Box
    bg="blue.0"
    c="blue.8"
    py={4}
    px={12}
    style={{
      borderRadius: rem(100),
      display: 'inline-block',
      fontWeight: 600,
      fontSize: rem(12),
      border: '1px solid var(--mantine-color-blue-1)'
    }}
  >
    {text}
  </Box>
);

export default LandingPageClient;