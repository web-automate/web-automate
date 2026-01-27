import { Box } from "@mantine/core";
import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <Box>
      {children}
    </Box>
  );
}