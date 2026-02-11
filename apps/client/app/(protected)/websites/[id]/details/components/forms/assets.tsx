import { notify } from "@/app/components/notifications";
import { useClientApi } from "@/lib/hooks/client.api";
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
import { UseFormReturnType } from "@mantine/form";
import { Website } from "@repo/database";
import { IconLayoutDashboard, IconPhoto, IconTrash } from "@tabler/icons-react";
import { useState } from "react";

interface AssetsFormProps {
  form: UseFormReturnType<Website>;
}

const AssetBox = ({
  label,
  description,
  value,
  ratio,
  onUpload, 
  onRemove
}: {
  label: string;
  description: string;
  value: string | null;
  ratio: number;
  onUpload: (file: File | null) => void;
  onRemove: () => void;
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
              <ActionIcon variant="white" color="red" size="sm" onClick={onRemove}>
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

const AssetsForm = ({ form }: AssetsFormProps) => {
  if (!form.values) return null;
  const website = form.values;

  const api = useClientApi();

  const [previews, setPreviews] = useState({
    logoSquare: form.values.logoSquare,
    logoRectangle: form.values.logoRectangle,
    favicon: form.values.favicon,
  });

  const { mutate } = api.MutateFile(
    `/api/websites/{id}/assets`,
    {
      onSuccess: () => {
        notify.success("Assets uploaded successfully");
      },
      onError: () => {
        notify.error("Failed to upload assets");
      },
      invalidateKeys: [['websites', website.id]]
    }
  );

  const handleUpload = async (type: keyof typeof previews, file: File | null) => {
    if (!file) return;

    setPreviews({ ...previews, [type]: URL.createObjectURL(file) });

    const uploadFormData = new FormData();
    uploadFormData.append("type", type);
    uploadFormData.append("file", file);

    mutate({
      params: { id: website.id },
      body: uploadFormData,
    });
  };

  const handleRemove = (type: keyof typeof previews) => {
    form.setFieldValue(type, null);
  };

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
                description="Recommended 120x120px (1:1)"
                value={form.values.logoSquare}
                ratio={1 / 1}
                onUpload={(file) => handleUpload('logoSquare', file)}
                onRemove={() => handleRemove('logoSquare')}
              />

              <AssetBox
                label="Favicon"
                description="Recommended .ico (1:1)"
                value={form.values.favicon}
                ratio={1 / 1}
                onUpload={(file) => handleUpload('favicon', file)}
                onRemove={() => handleRemove('favicon')}
              />

              <Box style={{ gridColumn: 'span 1' }}>
                <AssetBox
                  label="Logo Rectangle"
                  description="Recommended 350x75px (3:1)"
                  value={form.values.logoRectangle}
                  ratio={3 / 1}
                  onUpload={(file) => handleUpload('logoRectangle', file)}
                  onRemove={() => handleRemove('logoRectangle')}
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