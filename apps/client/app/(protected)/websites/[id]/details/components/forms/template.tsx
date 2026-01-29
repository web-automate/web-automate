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
import { UseFormReturnType } from "@mantine/form";
import { BuildTypeWebsitePayload, Template, Website } from "@repo/database";
import { IconCheck, IconPalette } from "@tabler/icons-react";

interface TemplateFormProps {
  form: UseFormReturnType<Website & { type?: BuildTypeWebsitePayload }>;
  templates?: Template[];
}

const TemplateForm = ({ form, templates }: TemplateFormProps) => {

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
            <Text size="xs" c="dimmed">Select the basic layout and theme structure for your website</Text>
          </Box>
        </Accordion.Control>

        <Accordion.Panel>
          <ScrollArea pt="md" pb="sm">
            <Flex gap="xs">
              {templates.map((template) => {
                const isSelected = form.values.templateId === template.id;

                return (
                  <UnstyledButton
                    key={template.id}
                    onClick={() => form.setFieldValue('templateId', template.id)}
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