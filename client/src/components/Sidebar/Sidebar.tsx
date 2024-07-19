"use client";
import {
  Box,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerOverlay,
} from "@chakra-ui/react";
import React from "react";
import SidebarContent from "./SidebarContent";

interface SidebarProps {
  onClose: VoidFunction;
  isOpen: boolean;
  variant: "drawer" | "sidebar";
}

const Sidebar: React.FC<SidebarProps> = ({ onClose, isOpen, variant }) => {
  return variant === "sidebar" ? (
    <Box
      color="gray.500"
      position="fixed"
      left={0}
      p={5}
      w="250px"
      top={0}
      h="100%"
      bg="#1E293B"
      shadow="lg"
      borderRight="1px solid #eaeaea"
    >
      <SidebarContent />
    </Box>
  ) : (
    <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
      <DrawerOverlay>
        <DrawerContent color={"gray.500"} bg="#1E293B" width="250px">
          <DrawerBody mt={5}>
            <SidebarContent onClose={onClose} />
          </DrawerBody>
        </DrawerContent>
      </DrawerOverlay>
    </Drawer>
  );
};

export default Sidebar;
