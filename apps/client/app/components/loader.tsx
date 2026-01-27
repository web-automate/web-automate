import { Center, Loader } from "@mantine/core";

export default function LoaderComponent({ height = '50dvh' }: { height?: string }) {
  return (
    <Center
      style={{ width: '100%', height }}
    >
      <Loader size="lg" />
    </Center>
  );
}