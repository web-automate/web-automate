'use client';

import { Burger, Drawer, NavLink, rem } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconArticle, IconFileCode, IconInfoCircle, IconSeo, IconSettings, IconTerminal2 } from '@tabler/icons-react';
import { useParams, usePathname, useRouter } from 'next/navigation';

export function WebsiteNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [opened, { open, close }] = useDisclosure(false);

  const iconStyle = { width: rem(16), height: rem(16) };

  const navItems = [
    { label: 'Details', value: 'details', icon: IconInfoCircle },
    { label: 'Articles', value: 'articles', icon: IconArticle },
    { label: 'Authors', value: 'authors', icon: IconFileCode },
    { label: 'Pages', value: 'pages', icon: IconFileCode },
    { label: 'SEO', value: 'seo', icon: IconSeo },
    { label: 'Logs', value: 'logs', icon: IconTerminal2 },
    { label: 'Settings', value: 'settings', icon: IconSettings },
  ];

  const activeTab = navItems.find(item => pathname.includes(`/${item.value}`))?.value || 'details';

  const handleNavigate = (value: string) => {
    router.push(`/websites/${params.id}/${value}`);
    close();
  };

  return (
    <>
      <Burger opened={opened} onClick={open} aria-label="Toggle navigation" size="sm" />
      
      <Drawer 
        opened={opened} 
        onClose={close} 
        title="Menu"
        padding="md"
        size="xs"
        zIndex={999}
      >
        {navItems.map((item) => (
          <NavLink
            key={item.value}
            active={activeTab === item.value}
            label={item.label}
            leftSection={<item.icon style={iconStyle} />}
            onClick={() => handleNavigate(item.value)}
            variant="filled"
          />
        ))}
      </Drawer>
    </>
  );
}