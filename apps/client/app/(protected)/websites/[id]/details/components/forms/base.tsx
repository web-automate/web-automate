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
import { Website } from "@repo/database";
import { IconLockFilled, IconSettings, IconWorld } from "@tabler/icons-react";

const BaseForm = ({ website }: { website?: Website }) => {

  if (!website) return null;

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
                description="Nama yang akan muncul di dashboard dan judul default"
                defaultValue={website?.name}
                placeholder="My Awesome Website"
              />

              <TextInput
                label="Domain"
                description="Domain utama website (tidak dapat diubah)"
                defaultValue={website?.domain}
                disabled
                rightSection={<IconLockFilled size={16} style={{ opacity: 0.5 }} />}
              />

              <Select
                label="Default Language"
                description="Bahasa utama yang digunakan untuk konten"
                defaultValue={website?.language}
                data={[
                  { value: 'en', label: 'English' },
                  { value: 'id', label: 'Bahasa Indonesia' },
                  { value: 'es', label: 'Spanish' },
                  { value: 'fr', label: 'French' }
                ]}
              />
            </Stack>
          </Box>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
};

export default BaseForm;