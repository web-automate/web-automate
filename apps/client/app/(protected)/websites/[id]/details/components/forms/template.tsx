import {
  Accordion,
  AspectRatio,
  Badge,
  Box,
  Flex,
  Group,
  Image,
  ScrollArea,
  Stack,
  Text,
  UnstyledButton
} from "@mantine/core";
import { Template, Website } from "@repo/database";
import { IconCheck, IconPalette } from "@tabler/icons-react";
import { useState } from "react";

interface TemplateFormProps {
  website: Website;
  templates?: Template[];
}

const TemplateForm = ({ website, templates }: TemplateFormProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState(website.templateId);

  if (!templates || templates.length === 0) {
    return null;
  }

  return (
    <Accordion variant="separated" defaultValue="template-selector">
      <Accordion.Item
        value="template-selector"
        style={{ border: '1px solid var(--mantine-color-gray-3)', borderRadius: 'var(--mantine-radius-md)' }}
      >
        <Accordion.Control icon={<IconPalette size={20} color="var(--mantine-color-blue-6)" />}>
          <Box>
            <Text fw={700} size="lg">Website Template</Text>
            <Text size="xs" c="dimmed">Pilih tampilan dasar dan struktur tema website Anda</Text>
          </Box>
        </Accordion.Control>

        <Accordion.Panel>
          <ScrollArea pt="md" pb="sm">
            <Flex gap="xs">
              {templates.map((template) => {
                const isSelected = selectedTemplate === template.id;

                return (
                  <UnstyledButton
                    key={template.id}
                    onClick={() => setSelectedTemplate(template.id)}
                    style={{
                      position: 'relative',
                      border: isSelected 
                        ? '2px solid var(--mantine-color-blue-6)' 
                        : '1px solid var(--mantine-color-gray-3)',
                      borderRadius: 'var(--mantine-radius-md)',
                      transition: 'all 0.2s ease',
                      backgroundColor: isSelected ? 'var(--mantine-color-blue-0)' : 'white',
                    }}
                  >
                    <Stack gap={0}>
                      <AspectRatio ratio={16 / 9}>
                        <Image
                          src={template.thumbnail || "https://placehold.co/600x400?text=No+Preview"}
                          alt={template.name}
                          radius="md"
                          p={4}
                        />
                      </AspectRatio>
                      
                      <Box p="sm">
                        <Group justify="space-between" wrap="nowrap">
                          <Box>
                            <Text fw={isSelected ? 700 : 500} size="sm" truncate>
                              {template.name}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {template.slug}
                            </Text>
                          </Box>
                          
                          {isSelected && (
                            <Badge variant="filled" color="blue" size="sm" circle p={0}>
                              <IconCheck size={8} />
                            </Badge>
                          )}
                        </Group>
                      </Box>
                    </Stack>
                  </UnstyledButton>
                );
              })}
            </Flex>
          </ScrollArea>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
};

export default TemplateForm;