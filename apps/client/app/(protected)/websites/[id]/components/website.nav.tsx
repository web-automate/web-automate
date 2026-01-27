'use client';
import { rem, ScrollArea, Tabs } from '@mantine/core';
import { IconArticle, IconFileCode, IconInfoCircle, IconSeo } from '@tabler/icons-react';
import { useParams, usePathname, useRouter } from 'next/navigation';

export function WebsiteNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  const tabs = ['details', 'articles', 'authors', 'pages', 'seo'];
  
  const activeTab = tabs.find(tab => pathname.includes(`/${tab}`)) || 'details';

  const iconStyle = { width: rem(16), height: rem(16) };

  const handleTabChange = (value: string | null) => {
    if (value) {
      router.push(`/websites/${params.id}/${value}`);
    }
  };

  return (
    <ScrollArea scrollbars="x" offsetScrollbars={false} type="never">
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant="pills"
        radius="md"
        styles={(theme) => ({
          tab: {
            fontWeight: 500,
            padding: `${theme.spacing.xs} ${theme.spacing.md}`,
            whiteSpace: 'nowrap',
            '&[dataActive]': {
              backgroundColor: theme.colors.blue[6],
              color: theme.white,
            },
          },
          list: {
            borderBottom: `1px solid ${theme.colors.gray[2]}`,
            paddingBottom: theme.spacing.xs,
            flexWrap: 'nowrap',
          }
        })}
      >
        <Tabs.List>
          <Tabs.Tab value="details" leftSection={<IconInfoCircle style={iconStyle} />}>
            Details
          </Tabs.Tab>
          <Tabs.Tab value="articles" leftSection={<IconArticle style={iconStyle} />}>
            Articles
          </Tabs.Tab>
          <Tabs.Tab value="authors" leftSection={<IconFileCode style={iconStyle} />}>
            Authors
          </Tabs.Tab>
          <Tabs.Tab value="pages" leftSection={<IconFileCode style={iconStyle} />}>
            Pages
          </Tabs.Tab>
          <Tabs.Tab value="seo" leftSection={<IconSeo style={iconStyle} />}>
            SEO
          </Tabs.Tab>
        </Tabs.List>
      </Tabs>
    </ScrollArea>
  );
}