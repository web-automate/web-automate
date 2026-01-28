'use client';
import { authClient, signIn, signUp } from "@/lib/auth.client";
import { Anchor, Button, Divider, Flex, Group, PasswordInput, Stack, Text, TextInput, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconBrandGithubFilled, IconBrandGoogleFilled, IconChevronLeft } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const AuthPageClient = () => {
    const { push } = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [socialLoading, setSocialLoading] = useState(false);
    const [isRegister, setIsRegister] = useState(false);

    const handleAuth = async () => {
        if (isRegister && password !== confirmPassword) {
            alert("Password tidak cocok");
            return;
        }

        setLoading(true);

        if (isRegister) {
            await signUp.email({
                email,
                password,
                name: name || email.split('@')[0],
                callbackURL: "/dashboard",
                fetchOptions: {
                    onError: (ctx) => {
                        setLoading(false);
                        notifications.show({
                            message: ctx.error.message,
                            position: "top-center",
                            color: "red",
                        });
                    },
                }
            });
        } else {
            await signIn.email({
                email,
                password,
                callbackURL: "/dashboard",
                fetchOptions: {
                    onError: (ctx) => {
                        setLoading(false);
                        notifications.show({
                            message: ctx.error.message,
                            position: "top-center",
                            color: "red",
                        });
                    }
                }
            });
        }
    };

    const handleSocialLogin = async (provider: "google" | "github") => {
        setSocialLoading(true);
        await signIn.social({
            provider: provider,
            callbackURL: "/dashboard",
            fetchOptions: {
                onError: (ctx) => {
                    setSocialLoading(false);
                    notifications.show({
                        message: ctx.error.message,
                        position: "top-center",
                        color: "red",
                    });
                }
            }
        });
        setSocialLoading(false);
    };

    useEffect(() => {
        const checkSession = async () => {
            const session = await authClient.getSession();
            if (session) {
                push("/dashboard");
            }
        };
        checkSession();
    }, [push]);

    return (
        <Stack style={{ maxWidth: 400, margin: "50px auto", padding: 20 }}>
            <Title order={2} mb="md">{isRegister ? "Register" : "Login"}</Title>

            <Stack>
                {isRegister && (
                    <TextInput
                        label="Nama"
                        placeholder="Nama Lengkap"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                )}

                <TextInput
                    label="Email"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <PasswordInput
                    label="Password"
                    placeholder="Rahasia"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                {isRegister && (
                    <PasswordInput
                        label="Konfirmasi Password"
                        placeholder="Ulangi Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                )}

                <Button onClick={handleAuth} loading={loading}>
                    {isRegister ? "Daftar" : "Login"} dengan Email
                </Button>

                <Text size="sm" ta="center">
                    {isRegister ? "Sudah punya akun? " : "Belum punya akun? "}
                    <Anchor component="button" onClick={() => setIsRegister(!isRegister)}>
                        {isRegister ? "Login" : "Daftar"}
                    </Anchor>
                </Text>
            </Stack>

            <Divider my="lg" label="Atau lanjutkan dengan" labelPosition="center" />

            <Group grow>
                <Button
                    variant="default"
                    loading={socialLoading}
                    leftSection={<IconBrandGoogleFilled size={18} />}
                    onClick={() => handleSocialLogin("google")}
                >
                    Google
                </Button>
                <Button
                    variant="default"
                    loading={socialLoading}
                    leftSection={<IconBrandGithubFilled size={18} />}
                    onClick={() => handleSocialLogin("github")}
                >
                    GitHub
                </Button>
            </Group>

            <Flex pt={12} justify={"center"}>
                <Anchor
                    display={"flex"}
                    ta={"center"}
                    style={{ alignItems: "center" }}
                    onClick={() => push("/")}
                >
                    <IconChevronLeft size={16} /> <Text size="sm">Back to Home</Text>
                </Anchor>
            </Flex>
        </Stack>
    );
}

export default AuthPageClient;