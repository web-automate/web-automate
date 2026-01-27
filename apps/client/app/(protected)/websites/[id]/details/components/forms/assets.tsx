import {
  Accordion,
  ActionIcon,
  AspectRatio,
  Box,
  FileButton,
  Group,
  Image,
  Paper,
  rem,
  SimpleGrid,
  Stack,
  Text
} from "@mantine/core";
import { Website } from "@repo/database";
import { IconLayoutDashboard, IconPhoto, IconTrash } from "@tabler/icons-react";
import { useState } from "react";

const AssetsForm = ({ website }: { website: Website }) => {
  const [previews, setPreviews] = useState({
    logoSquare: website.logoSquare,
    logoRectangle: website.logoRectangle,
    favicon: website.favicon,
  });

  const AssetBox = ({
    label,
    description,
    value,
    ratio,
    onUpload
  }: {
    label: string;
    description: string;
    value: string | null;
    ratio: number;
    onUpload: (file: File | null) => void;
  }) => (
    <Stack gap="xs">
      <Box>
        <Text fw={600} size="sm">{label}</Text>
        <Text size="xs" c="dimmed">{description}</Text>
      </Box>

      <Paper withBorder p="xs" radius="md" bg="var(--mantine-color-gray-0)">
        <AspectRatio ratio={ratio} maw="100%" mx="auto">
          {value ? (
            <Box pos="relative">
              <Image src={value} radius="md" alt={label} fit="contain" />
              <Group gap={5} pos="absolute" top={5} right={5}>
                <ActionIcon variant="white" color="red" size="sm" onClick={() => onUpload(null)}>
                  <IconTrash style={{ width: rem(14) }} />
                </ActionIcon>
              </Group>
            </Box>
          ) : (
            <FileButton onChange={onUpload} accept="image/png,image/jpeg,image/svg+xml">
              {(props) => (
                <Stack
                  {...props}
                  align="center"
                  justify="center"
                  gap="xs"
                  style={{ cursor: 'pointer', border: '1px dashed var(--mantine-color-gray-4)', borderRadius: rem(8) }}
                >
                  <IconPhoto style={{ width: rem(24), opacity: 0.5 }} />
                  <Text size="xs" c="dimmed">Upload</Text>
                </Stack>
              )}
            </FileButton>
          )}
        </AspectRatio>
      </Paper>
    </Stack>
  );

  return (
    <Accordion variant="separated" defaultValue="brand-assets">
      <Accordion.Item value="brand-assets" style={{ border: '1px solid var(--mantine-color-gray-3)', borderRadius: 'var(--mantine-radius-md)' }}>
        <Accordion.Control icon={<IconLayoutDashboard size={20} color="var(--mantine-color-blue-6)" />}>
          <Box>
            <Text fw={700} size="lg">Brand Assets</Text>
            <Text size="xs" c="dimmed">Brand logo and visual identity</Text>
          </Box>
        </Accordion.Control>
        
        <Accordion.Panel>
          <Box pt="md">
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
              <AssetBox
                label="Logo Square"
                description="Recommended 512x512px (1:1)"
                value={previews.logoSquare}
                ratio={1 / 1}
                onUpload={(file) => console.log('Upload Square', file)}
              />

              <AssetBox
                label="Favicon"
                description="Recommended .ico or .png (1:1)"
                value={previews.favicon}
                ratio={1 / 1}
                onUpload={(file) => console.log('Upload Favicon', file)}
              />

              <Box style={{ gridColumn: 'span 1' }}>
                <AssetBox
                  label="Logo Rectangle"
                  description="Recommended 1200x400px (3:1)"
                  value={previews.logoRectangle}
                  ratio={3 / 1}
                  onUpload={(file) => console.log('Upload Rectangle', file)}
                />
              </Box>
            </SimpleGrid>
          </Box>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
}

export default AssetsForm;