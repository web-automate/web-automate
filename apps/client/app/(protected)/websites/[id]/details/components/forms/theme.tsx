import { generateMantinePalette, getHarmonyColor } from "@/lib/helpers/color";
import { Accordion, Box, ColorPicker, ColorSwatch, Group, Paper, Select, SimpleGrid, Stack, Text } from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import type { BuildTypeWebsitePayload, Website } from "@repo/database";
import { IconCircleCheck, IconPalette } from "@tabler/icons-react";
import { useEffect, useState } from "react";

interface ThemeProps {
  form: UseFormReturnType<Website & { type?: BuildTypeWebsitePayload }>;
}

const ThemeConfigForm = ({ form }: ThemeProps) => {
  const [harmony, setHarmony] = useState<string>("complementary");
  
  const themeConfig = (form.values?.themeConfig as any) || {
    primary: generateMantinePalette("#228be6"),
    secondary: generateMantinePalette("#fab005"),
  };

  const updatePalette = (key: "primary" | "secondary", baseColor: string) => {
    const newPalette = generateMantinePalette(baseColor);
    form.setFieldValue("themeConfig", {
      ...themeConfig,
      [key]: newPalette,
    });
  };

  useEffect(() => {
    if (harmony !== "custom" && themeConfig.primary?.["600"]) {
      const basePrimary = themeConfig.primary["600"];
      const newSecondaryHex = getHarmonyColor(basePrimary, harmony);
      
      if (newSecondaryHex !== themeConfig.secondary?.["600"]) {
        updatePalette("secondary", newSecondaryHex);
      }
    }
  }, [themeConfig.primary?.["600"], harmony]);

  return (
    <Accordion variant="separated" defaultValue="theme-settings">
      <Accordion.Item value="theme-settings" style={{ border: '1px solid var(--mantine-color-gray-3)', borderRadius: 'var(--mantine-radius-md)' }}>
        <Accordion.Control icon={<IconPalette size={20} color="var(--mantine-color-blue-6)" />}>
          <Box>
            <Text fw={700} size="lg">Theme Configuration</Text>
            <Text size="xs" c="dimmed">Generasi palet warna 50-950 otomatis untuk website Anda</Text>
          </Box>
        </Accordion.Control>

        <Accordion.Panel>
          <Stack gap="xl" pt="md">
            <Select
              label="Color Harmony Strategy"
              value={harmony}
              onChange={(val) => setHarmony(val || "custom")}
              allowDeselect={false}
              data={[
                { value: 'complementary', label: 'Complementary' },
                { value: 'analogous', label: 'Analogous' },
                { value: 'triadic', label: 'Triadic' },
                { value: 'custom', label: 'Custom' },
              ]}
            />

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
              <Paper withBorder p="md" radius="md">
                <Text fw={600} size="sm" mb="md">Primary Palette (Base: 600)</Text>
                <Stack gap="md">
                  <ColorPicker 
                    fullWidth 
                    value={themeConfig.primary?.["600"]}
                    onChange={(val) => updatePalette("primary", val)}
                  />
                  <Group gap={4} grow>
                    {Object.entries(themeConfig.primary || {}).map(([shade, color]) => (
                      <Box key={shade}>
                        <ColorSwatch color={color as string} size={14} radius={2} />
                      </Box>
                    ))}
                  </Group>
                </Stack>
              </Paper>

              <Paper withBorder p="md" radius="md" style={{ opacity: harmony !== "custom" ? 0.9 : 1 }}>
                <Group justify="space-between" mb="md">
                  <Text fw={600} size="sm">Secondary Palette</Text>
                  {harmony !== "custom" && <IconCircleCheck size={16} color="green" />}
                </Group>
                <Stack gap="md">
                  <ColorPicker 
                    fullWidth 
                    value={themeConfig.secondary?.["600"]}
                    onChange={(val) => harmony === "custom" && updatePalette("secondary", val)}
                  />
                  <Group gap={4} grow>
                    {Object.entries(themeConfig.secondary || {}).map(([shade, color]) => (
                      <Box key={shade}>
                        <ColorSwatch color={color as string} size={14} radius={2} />
                      </Box>
                    ))}
                  </Group>
                </Stack>
              </Paper>
            </SimpleGrid>

            <Paper p="sm" bg="gray.0" radius="md">
              <Group gap="xs">
                <Text size="xs" fw={600}>Main Brand Colors:</Text>
                <ColorSwatch color={themeConfig.primary?.["600"]} size={24} radius="sm" />
                <ColorSwatch color={themeConfig.secondary?.["600"]} size={24} radius="sm" />
                <Text size="xs" c="dimmed">
                  Mantine palette terdeteksi untuk domain <strong>{form.values?.domain}</strong>.
                </Text>
              </Group>
            </Paper>
          </Stack>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
};

export default ThemeConfigForm;