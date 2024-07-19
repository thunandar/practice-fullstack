"use client";
import Navbar from "@/src/components/Sidebar/Navbar";
import Sidebar from "@/src/components/Sidebar/Sidebar";
import { Box, useBreakpointValue } from "@chakra-ui/react";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { getAuth, getToken } from "../lib/auth";
const smVariant = { navigation: "drawer", navigationButton: true };
const mdVariant = { navigation: "sidebar", navigationButton: false };

const ThemeWrapper = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const variants = useBreakpointValue({ base: smVariant, md: mdVariant });
  const router = useRouter();
  const pathname = usePathname();
  const [check, setCheck] = useState(true);
  const logInpath = pathname.includes("/login");
  const accessToken = getToken();
  const avaliablePath =
    pathname.includes("/dashboard") ||
    pathname.includes("/admin") ||
    pathname.includes("/owner") ||
    pathname.includes("/users") ||
    pathname.includes("/region") ||
    pathname.includes("/township") ||
    pathname.includes("/sport_types") ||
    pathname.includes("/banner") ||
    pathname.includes("/help") ||
    pathname.includes("/bookingLists");
    pathname.includes("/pricing");
  const checkingPathAndNavigationButton =
    avaliablePath && !variants?.navigationButton;

  useEffect(() => {
    const checkAuth = getAuth();

    if (
      checkAuth === null ||
      checkAuth?.status === 1 ||
      accessToken === undefined
    ) {
      router.push("./login");
    } else if (pathname === "/login" && checkAuth !== null) {
      router.push("/");
    }
    setCheck(true);
  }, [pathname]);

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);
  return (
    <>
      {check === true && (
        <Box>
          {!logInpath && (
            <Sidebar
              variant={(variants?.navigation as "drawer") || "sidebar"}
              isOpen={isSidebarOpen}
              onClose={toggleSidebar}
            />
          )}
          <Box ml={checkingPathAndNavigationButton ? 250 : 0}>
            {!logInpath && (
              <Navbar
                showSidebarButton={variants?.navigationButton}
                onShowSidebar={toggleSidebar}
              />
            )}
            <Box
              px={{ base: "0", md: logInpath ? 0 : 10 }}
              py={{ base: "0", md: logInpath ? 0 : 10 }}
              ml={checkingPathAndNavigationButton ? 0 : 0}
            >
              {children}
            </Box>
          </Box>
        </Box>
      )}
    </>
  );
};

export default ThemeWrapper;
