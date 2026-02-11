"use client";

import LoaderComponent from "@/app/components/loader";
import { notify } from "@/app/components/notifications";
import { useClientApi } from "@/lib/hooks/client.api";
import {
  Affix,
  Button,
  em,
  rem,
  Stack,
  Transition
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useMediaQuery } from "@mantine/hooks";
import type { BuildTypeWebsitePayload, Template, Website } from "@repo/database";
import { IconDeviceFloppy } from "@tabler/icons-react";
import { notFound } from "next/navigation";
import { useEffect } from "react";
import AnalyticsForm from "./components/forms/analytics";
import AssetsForm from "./components/forms/assets";
import BaseForm from "./components/forms/base";
import TemplateForm from "./components/forms/template";
import ThemeConfigForm from "./components/forms/theme";

interface WebsiteManageClientProps {
  id: string;
}

export default function WebsiteManageClient({ id }: WebsiteManageClientProps) {
  const isMobile = useMediaQuery(`(max-width: ${em(768)})`);
  const api = useClientApi();

  const { data: website, isLoading } = api.Get<Website>(
    `/api/websites/${id}`,
    ['websites', id],
  );

  const { data: templates } = api.Get<Template[]>(
    `/api/templates?websiteId=${id}`,
    ['templates', id],
  );

  const { mutate, isPending } = api.Mutate(
    `/api/websites/{id}`,
    { method: "PATCH" },
    {
      onSuccess: () => {
        notify.success("Website configuration saved and queued for build");
      },
      onError: () => {
        notify.error("Failed to save changes");
      },
      invalidateKeys: [['websites', id]]
    }
  );

  const form = useForm<Website & { type?: BuildTypeWebsitePayload }>({
    mode: "uncontrolled",
    initialValues: {
      name: website?.name ?? '',
      status: website?.status ?? 'DRAFT',
      createdAt: website?.createdAt ?? new Date(),
      updatedAt: website?.updatedAt ?? new Date(),
      domain: website?.domain ?? '',
      logoSquare: website?.logoSquare ?? null,
      logoRectangle: website?.logoRectangle ?? null,
      favicon: website?.favicon ?? null,
      language: website?.language ?? '',
      templateId: website?.templateId ?? '',
      themeConfig: website?.themeConfig ?? null,
      googleAnalyticsId: website?.googleAnalyticsId === null ? "G-XXXXXX" : website?.googleAnalyticsId,
      ownerId: website?.ownerId ?? '',
      type: "BUILD_WEBSITE" as BuildTypeWebsitePayload,
    } as any,
    validate: {
      name: (value) => value.length > 0 || "Website name is required",
      domain: (value) => value.length > 0 || "Website domain is required",
      templateId: (value) => value.length > 0 || "Website template is required",
    },
  });

  useEffect(() => {
    if (website) {
      form.setValues(website);
      form.resetDirty();
    }
  }, [website]);

  if (isLoading) return <LoaderComponent />;
  if (!website) return notFound();

  const handleSave = () => {
    mutate({
      params: {
        id: website.id,
      },
      body: form.values,
    });
  };

  return (
    <Stack gap="lg">
      <BaseForm form={form} />
      <AssetsForm form={form} />
      <TemplateForm form={form} templates={templates} />
      <AnalyticsForm form={form} />
      <ThemeConfigForm form={form} />

      <Affix position={{ bottom: isMobile ? 120 : 20, right: 20 }}>
        <Transition transition="slide-up" mounted={true}>
          {(transitionStyles) => (
            <Button
              style={transitionStyles}
              leftSection={<IconDeviceFloppy size={20} />}
              radius="xl"
              size={isMobile ? "md" : "lg"}
              onClick={handleSave}
              loading={isPending}
              styles={{
                root: {
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  height: rem(48),
                  paddingLeft: rem(20),
                  paddingRight: rem(20)
                }
              }}
            >
              Save & Build
            </Button>
          )}
        </Transition>
      </Affix>
    </Stack>
  );
}