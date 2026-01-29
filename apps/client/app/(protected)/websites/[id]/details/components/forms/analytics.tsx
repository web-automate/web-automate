import {
  Accordion,
  Alert,
  Anchor,
  Box,
  Group,
  Input,
  rem,
  Stack,
  Text
} from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import type { Website } from "@repo/database";
import { IconChartBar, IconExternalLink, IconInfoCircle } from "@tabler/icons-react";

const AnalyticsForm = ({ form }: { form: UseFormReturnType<Website> }) => {
  return (
    <Accordion variant="separated" defaultValue="google-analytics">
      <Accordion.Item
        value="google-analytics"
        style={{ border: '1px solid var(--mantine-color-gray-3)', borderRadius: 'var(--mantine-radius-md)' }}
      >
        <Accordion.Control icon={<IconChartBar size={20} color="var(--mantine-color-blue-6)" />}>
          <Box>
            <Text fw={700} size="lg">Google Analytics</Text>
            <Text size="xs" c="dimmed">Track and analyze website performance and visitor traffic</Text>
          </Box>
        </Accordion.Control>

        <Accordion.Panel>
          <Box pt="md">
            <Stack gap="md">
              <Alert
                variant="light"
                color="blue"
                title="Information"
                icon={<IconInfoCircle size={18} />}
                radius="md"
              >
                Enter your Google Analytics 4 (GA4) Measurement ID (G-XXXXX) to start tracking visitor statistics.
              </Alert>

              <Input.Wrapper
                label="Measurement ID"
                description={
                  <Group gap={4} mt={4} component={"span"}>
                    <Text size="xs" component="span">Find this ID in your Google Analytics dashboard</Text>
                    <Anchor
                      href="https://analytics.google.com"
                      target="_blank"
                      size="xs"
                      display="flex"
                      style={{ alignItems: 'center', gap: rem(2) }}
                    >
                      Google Analytics <IconExternalLink size={10} />
                    </Anchor>
                  </Group>
                }
              >
                <Input
                  placeholder="G-XXXXXXXXXX"
                  mt={5}
                  inputMode="text"
                  {...form.getInputProps('googleAnalyticsId')}
                />
              </Input.Wrapper>

              <Box mt="xs">
                <Text size="xs" fw={500} mb={4}>How to Connect:</Text>
                <Text size="xs" c="dimmed" component="div">
                  <ol style={{ margin: 0, paddingLeft: rem(16) }}>
                    <li>Open Admin in your Google Analytics property.</li>
                    <li>Go to "Data Streams" and click on your website stream.</li>
                    <li>Copy the "Measurement ID" shown in the top right corner.</li>
                  </ol>
                </Text>
              </Box>
            </Stack>
          </Box>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
};

export default AnalyticsForm;