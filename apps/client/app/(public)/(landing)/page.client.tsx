'use client';
import { Button, Stack } from "@mantine/core";
import { useRouter } from "next/navigation";

const LandingPageClient = () => {
  const { push } = useRouter();
  return (
    <Stack p="md">
      <h1>Welcome to the Landing Page</h1>
      <Button onClick={() => push("/auth")}>login</Button>
    </Stack>
  );
}

export default LandingPageClient;