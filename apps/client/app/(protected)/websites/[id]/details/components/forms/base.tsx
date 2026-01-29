import {
  Accordion,
  Avatar,
  Badge,
  Box,
  Group,
  Select,
  Stack,
  Text,
  TextInput
} from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import { Website } from "@repo/database";
import { IconLockFilled, IconSettings, IconWorld } from "@tabler/icons-react";

interface BaseFormProps {
  form: UseFormReturnType<Website>;
}

const BaseForm = ({ form }: BaseFormProps) => {

  if (!form.values) return null;

  const website = form.values;

  return (
    <Accordion variant="separated" defaultValue="base-info">
      <Accordion.Item
        value="base-info"
        style={{ border: '1px solid var(--mantine-color-gray-3)', borderRadius: 'var(--mantine-radius-md)' }}
      >
        <Accordion.Control icon={<IconSettings size={20} color="var(--mantine-color-blue-6)" />}>
          <Box>
            <Text fw={700} size="lg">General Information</Text>
            <Text size="xs" c="dimmed">Basic configuration and website identity</Text>
          </Box>
        </Accordion.Control>

        <Accordion.Panel>
          <Box pt="md">
            <Group mb="xl" wrap="nowrap">
              <Avatar
                src={website?.logoSquare}
                size="xl"
                radius="md"
                color="blue"
              >
                {website?.name?.slice(0, 2).toUpperCase() || ''}
              </Avatar>
              <div style={{ flex: 1 }}>
                <Text fw={600} size="lg">{website?.name || ''}</Text>
                <Group gap={6}>
                  <IconWorld size={14} style={{ opacity: 0.5 }} />
                  <Text size="sm" c="dimmed">{website?.domain || ''}</Text>
                </Group>
                <Badge
                  mt="xs"
                  variant="light"
                  color={website?.status === 'PUBLISHED' ? 'green' : website?.status === 'DRAFT' ? 'gray' : 'yellow'}
                >
                  {website?.status}
                </Badge>
              </div>
            </Group>

            <Stack gap="md">
              <TextInput
                label="Website Name"
                description="The name that will appear on the dashboard and the default title"
                placeholder="My Awesome Website"
                {...form.getInputProps('name')}
              />

              <TextInput
                label="Domain"
                description="Primary website domain (cannot be changed)"
                disabled
                rightSection={<IconLockFilled size={16} style={{ opacity: 0.5 }} />}
                {...form.getInputProps('domain')}
              />

              <Select
                label="Default Language"
                description="Primary language used for content"
                unselectable="on"
                data={[
                  { value: 'en', label: 'English' },
                  { value: 'id', label: 'Bahasa Indonesia' },
                  { value: 'es', label: 'Spanish' },
                  { value: 'fr', label: 'French' }
                ]}
                {...form.getInputProps('language')}
                value={form.values.language ?? ''}
              />
            </Stack>
          </Box>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
};

export default BaseForm;