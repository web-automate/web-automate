"use client";

import LoaderComponent from "@/app/components/loader";
import { notify } from "@/app/components/notifications";
import { getTemplates } from "@/lib/hooks/template";
import { getWebsiteById } from "@/lib/hooks/use.website";
import {
  Affix,
  Button,
  em,
  rem,
  Stack,
  Transition
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconFileDescriptionFilled } from "@tabler/icons-react";
import { notFound, useRouter } from "next/navigation";
import { useState } from "react";
import AnalyticsForm from "./components/forms/analytics";
import AssetsForm from "./components/forms/assets";
import BaseForm from "./components/forms/base";
import TemplateForm from "./components/forms/template";
import ThemeConfigForm from "./components/forms/theme";

interface WebsiteManageClientProps {
  id: string;
}


export default function WebsiteManageClient({ id }: WebsiteManageClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isMobile = useMediaQuery(`(max-width: ${em(768)})`);
  const { data: website, isLoading, isError } = getWebsiteById(id);
  const { data: templates, isLoading: isLoadingTemplates, isError: isErrorTemplates } = getTemplates();
  if (isLoading) {
    return (
      <LoaderComponent />
    );
  }

  if (!website) {
    return notFound();
  }

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      notify.success("Website details saved successfully!");
    }, 2000);
  }

  return (
    <Stack gap="lg">
      <BaseForm website={website} />
      <AssetsForm website={website} />
      <TemplateForm website={website} templates={templates} />  
      <AnalyticsForm website={website} />
      <ThemeConfigForm website={website} />

      <Affix position={{ bottom: isMobile ? 120 : 20, right: 20 }}>
        <Transition transition="slide-up" mounted={true}>
          {(transitionStyles) => (
            <Button
              style={transitionStyles}
              leftSection={<IconFileDescriptionFilled size={20} />}
              radius="xl"
              size={isMobile ? "md" : "lg"}
              onClick={handleSave}
              loading={loading}
              styles={{
                root: {
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  height: rem(48),
                  paddingLeft: rem(20),
                  paddingRight: rem(20)
                }
              }}
            >
              Save
            </Button>
          )}
        </Transition>
      </Affix>
    </Stack>
  );
}