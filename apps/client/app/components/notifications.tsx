import { rem } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconAlertTriangle, IconCheck, IconInfoCircle, IconX } from '@tabler/icons-react';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface NotificationOptions {
  title?: string;
  message: string;
  type?: NotificationType;
  autoClose?: number | false;
  withCloseButton?: boolean;
}

const notificationConfig = {
  success: {
    color: 'teal',
    icon: <IconCheck style={{ width: rem(20), height: rem(20) }} />,
    title: 'Success',
  },
  error: {
    color: 'red',
    icon: <IconX style={{ width: rem(20), height: rem(20) }} />,
    title: 'Error',
  },
  info: {
    color: 'blue',
    icon: <IconInfoCircle style={{ width: rem(20), height: rem(20) }} />,
    title: 'Info',
  },
  warning: {
    color: 'yellow',
    icon: <IconAlertTriangle style={{ width: rem(20), height: rem(20) }} />,
    title: 'Warning',
  },
};

export const showNotification = ({
  title,
  message,
  type = 'info',
  autoClose = 4000,
  withCloseButton = true,
}: NotificationOptions) => {
  const config = notificationConfig[type];

  notifications.show({
    title: title || config.title,
    message,
    color: config.color,
    icon: config.icon,
    autoClose,
    withCloseButton,
    withBorder: false,
    position: 'top-center',
    styles: (theme) => ({
      root: {
        backgroundColor: theme.white,
        border: 'none',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        backdropFilter: 'blur(10px)',
        borderRadius: rem(12),
        padding: rem(16),
        '&::before': {
          display: 'none',
        },
      },
      icon: {
        backgroundColor: theme.colors[config.color][0],
        color: theme.colors[config.color][6],
        borderRadius: rem(8),
        width: rem(36),
        height: rem(36),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
      title: {
        color: theme.colors.dark[8],
        fontWeight: 600,
        fontSize: rem(15),
        marginBottom: rem(4),
      },
      description: {
        color: theme.colors.dark[5],
        fontSize: rem(14),
        lineHeight: 1.5,
      },
      closeButton: {
        color: theme.colors.dark[4],
        borderRadius: rem(6),
        '&:hover': {
          backgroundColor: theme.colors.gray[1],
          color: theme.colors.dark[7],
        },
      },
    }),
  });
};

export const notify = {
  success: (message: string, title?: string) =>
    showNotification({ message, title, type: 'success' }),
  
  error: (message: string, title?: string) =>
    showNotification({ message, title, type: 'error', autoClose: 5000 }),
  
  info: (message: string, title?: string) =>
    showNotification({ message, title, type: 'info' }),
  
  warning: (message: string, title?: string) =>
    showNotification({ message, title, type: 'warning' }),
};