'use client';

import { Box } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import Navbar from "./components/navbar";

const ProtectedLayout = ({ children }: { children: ReactNode }) => {
  const queryClient = new QueryClient()
  return (
    <QueryClientProvider client={queryClient}>
      <Box p={"md"} pb={160}>
        {children}
        <Navbar />
      </Box>
    </QueryClientProvider>
  );
}

export default ProtectedLayout;