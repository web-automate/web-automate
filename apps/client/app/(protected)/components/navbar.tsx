'use client';

import { Box, Flex, Text, UnstyledButton, rem } from "@mantine/core";
import { IconHome, IconSettings, IconWorld } from "@tabler/icons-react";
import { LayoutGroup, motion } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';

const navMenu = [
    { label: 'Dashboard', Icon: IconHome, href: '/dashboard' },
    { label: 'Websites', Icon: IconWorld, href: '/websites' },
    { label: 'Settings', Icon: IconSettings, href: '/settings' },
];

export default function Navbar() {
    const { push } = useRouter();
    const pathname = usePathname();

    const found = navMenu.findIndex((item) => {
        if (item.href === '/') return pathname === '/';
        return pathname === item.href || pathname.startsWith(`${item.href}/`);
    });
    
    const activeIndex = found === -1 ? 0 : found;

    return (
        <Box
            pos="fixed"
            bottom={rem(24)}
            left={0}
            right={0}
            px="md"
            style={{ zIndex: 50, display: 'flex', justifyContent: 'center' }}
        >
            <Box
                w="100%"
                maw={rem(416)}
                bg="rgba(255, 255, 255, 0.9)"
                style={{
                    backdropFilter: 'blur(12px)',
                    borderRadius: rem(24),
                    border: '1px solid var(--mantine-color-gray-2)',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    position: 'relative'
                }}
                px="xs"
                py="sm"
            >
                <Flex align="flex-end" justify="space-between">
                    <LayoutGroup>
                        {navMenu.map((item, index) => {
                            const isActive = activeIndex === index;

                            return (
                                <UnstyledButton
                                    key={item.label}
                                    onClick={() => push(item.href)}
                                    style={{
                                        flex: 1,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        position: 'relative',
                                        background: 'transparent',
                                        cursor: 'pointer',
                                        height: rem(50) 
                                    }}
                                >
                                    {isActive && (
                                        <Box
                                            component={motion.span} 
                                            layoutId="nav-bubble"
                                            style={{
                                                position: 'absolute',
                                                top: rem(-36),
                                                width: rem(56),
                                                height: rem(56),
                                                borderRadius: '50%',
                                                background: 'linear-gradient(135deg, var(--mantine-color-orange-4), var(--mantine-color-orange-6))',
                                                boxShadow: '0 10px 15px -3px rgba(255, 120, 0, 0.4)',
                                            }}
                                            transition={{
                                                type: 'spring',
                                                stiffness: 400,
                                                damping: 30
                                            }}
                                        />
                                    )}

                                    <Box
                                        component={motion.span}
                                        animate={{
                                            y: isActive ? -32 : -8,
                                        }}
                                        transition={{
                                            type: 'spring',
                                            stiffness: 300,
                                            damping: 25
                                        }}
                                        style={{
                                            position: 'relative',
                                            zIndex: 10,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <item.Icon
                                            style={{
                                                width: rem(24),
                                                height: rem(24),
                                                color: isActive ? 'white' : 'var(--mantine-color-gray-5)',
                                                transition: 'color 0.3s ease'
                                            }}
                                            stroke={2}
                                        />
                                    </Box>

                                    <Text
                                        component="span"
                                        size={rem(10)}
                                        fw={600}
                                        style={{
                                            position: 'absolute',
                                            bottom: rem(4),
                                            transition: 'all 0.3s ease',
                                            color: isActive ? 'var(--mantine-color-orange-8)' : 'var(--mantine-color-gray-8)'
                                        }}
                                    >
                                        {item.label}
                                    </Text>
                                </UnstyledButton>
                            );
                        })}
                    </LayoutGroup>
                </Flex>
            </Box>
        </Box>
    );
}