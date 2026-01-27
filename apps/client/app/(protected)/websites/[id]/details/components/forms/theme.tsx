import { getHarmonyColor } from "@/lib/helpers/color";
import { Accordion, Box, ColorPicker, ColorSwatch, Group, Paper, Select, SimpleGrid, Slider, Stack, Text } from "@mantine/core";
import { Website } from "@repo/database";
import { IconCircleCheck, IconPalette } from "@tabler/icons-react";
import { useEffect, useState } from "react";

const ThemeConfigForm = ({ website }: { website: Website }) => {
  const [harmony, setHarmony] = useState<string>("complementary");
  
  const [config, setConfig] = useState(() => {
    const saved = (website.themeConfig as any) || {};
    return {
      primary: saved.primary || "#228be6",
      secondary: saved.secondary || "#fab005",
      primaryShade: saved.primaryShade || 600,
      secondaryShade: saved.secondaryShade || 600,
    };
  });

  useEffect(() => {
    if (harmony !== "custom") {
      const newSecondary = getHarmonyColor(config.primary, harmony);
      setConfig(prev => ({ ...prev, secondary: newSecondary }));
    }
  }, [config.primary, harmony]);

  return (
    <Accordion variant="separated" defaultValue="theme-settings">
      <Accordion.Item value="theme-settings" style={{ border: '1px solid var(--mantine-color-gray-3)', borderRadius: 'var(--mantine-radius-md)' }}>
        <Accordion.Control icon={<IconPalette size={20} color="var(--mantine-color-blue-6)" />}>
          <Box>
            <Text fw={700} size="lg">Theme Configuration</Text>
            <Text size="xs" c="dimmed">Atur skema warna dan harmoni visual secara manual atau otomatis</Text>
          </Box>
        </Accordion.Control>

        <Accordion.Panel>
          <Stack gap="xl" pt="md">
            <Select
              label="Color Harmony Strategy"
              value={harmony}
              onChange={(val) => setHarmony(val || "custom")}
              data={[
                { value: 'complementary', label: 'Complementary (Kontras Tinggi)' },
                { value: 'analogous', label: 'Analogous (Harmonis/Kalem)' },
                { value: 'triadic', label: 'Triadic (Variatif)' },
                { value: 'custom', label: 'Custom (Tentukan Sendiri)' },
              ]}
            />

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
              {/* Primary Color Section */}
              <Paper withBorder p="md" radius="md">
                <Text fw={600} size="sm" mb="md">Primary Color</Text>
                <Stack gap="md">
                  <ColorPicker 
                    fullWidth 
                    value={config.primary}
                    onChange={(val) => setConfig({ ...config, primary: val })}
                  />
                  <Box>
                    <Text size="xs" fw={500} mb={5}>Contrast Shade (50-950): {config.primaryShade}</Text>
                    <Slider
                      min={50} max={950} step={50}
                      value={config.primaryShade}
                      onChange={(val) => setConfig({ ...config, primaryShade: val })}
                      marks={[{ value: 50 }, { value: 500 }, { value: 950 }]}
                    />
                  </Box>
                </Stack>
              </Paper>

              {/* Secondary Color Section */}
              <Paper withBorder p="md" radius="md" style={{ opacity: harmony !== "custom" ? 0.9 : 1 }}>
                <Group justify="space-between" mb="md">
                  <Text fw={600} size="sm">Secondary Color</Text>
                  {harmony !== "custom" && <IconCircleCheck size={16} color="green" />}
                </Group>
                <Stack gap="md">
                  <ColorPicker 
                    fullWidth 
                    value={config.secondary}
                    onChange={(val) => harmony === "custom" && setConfig({ ...config, secondary: val })}
                  />
                  <Box>
                    <Text size="xs" fw={500} mb={5}>Contrast Shade (50-950): {config.secondaryShade}</Text>
                    <Slider
                      min={50} max={950} step={50}
                      value={config.secondaryShade}
                      onChange={(val) => setConfig({ ...config, secondaryShade: val })}
                    />
                  </Box>
                </Stack>
              </Paper>
            </SimpleGrid>

            {/* Live Preview Swatch */}
            <Paper p="sm" bg="gray.0" radius="md">
              <Group gap="xs">
                <Text size="xs" fw={600}>Visual Preview:</Text>
                <ColorSwatch color={config.primary} size={24} radius="sm" />
                <ColorSwatch color={config.secondary} size={24} radius="sm" />
                <Text size="xs" c="dimmed">
                  Data ini akan disimpan sebagai config tema untuk website {website.domain}.
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