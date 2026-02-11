'use client';

import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import '@mantine/notifications/styles.css';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MantineProvider defaultColorScheme="auto">
      <Notifications
        position="top-right"
        zIndex={1000}
        limit={5}
        autoClose={4000}
        styles={{
          notification: {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            border: '1px solid',
          },
        }}
      />
      {children}
    </MantineProvider>
  );
}