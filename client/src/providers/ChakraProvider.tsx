"use client";
import React from "react";
import { ChakraProvider } from "@chakra-ui/react";
import { theme } from "@/theme";

interface ProviderProps {
  children: React.ReactNode;
}

const Provider: React.FC<ProviderProps> = ({ children }) => {
  return (
    <ChakraProvider theme={theme} cssVarsRoot="body">
      {children}
    </ChakraProvider>
  );
};

export default Provider;
