"use client";
import { Link, LinkProps as ChakraLinkProps } from "@chakra-ui/next-js";
import { useColorModeValue } from "@chakra-ui/react";
import { usePathname } from "next/navigation";
import { LinkProps as NextLinkProps } from "next/link";

export default function NavLink({
  href,
  children,
  ...rest
}: ChakraLinkProps & NextLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      fontWeight={500}
      width="100%"
      className={isActive ? "active-class" : ""}
      px={2}
      py={1}
      rounded={"md"}
      _hover={{
        textDecoration: "none",
        color: useColorModeValue("#ccc", "#fff"),
      }}
      _activeLink={{
        textDecoration: "none",
        color: useColorModeValue("#fff", "#fff"),
      }}
      href={href}
      aria-current={isActive ? "page" : undefined}
      {...rest}
    >
      {children}
    </Link>
  );
}
