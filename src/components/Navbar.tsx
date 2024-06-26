import Link from "next/link";
import { AppShellHeader, Flex, Text } from "@mantine/core";

export function Navbar() {
  return (
    <AppShellHeader
      bg="blue"
      style={{
        boxShadow: "var(--mantine-shadow-sm)",
      }}
    >
      <Flex align="center" justify="center" style={{ height: "100%" }}>
        <Text c="white" component={Link} href="/" fw={500} fz={24}>
          Numerical Method
        </Text>
      </Flex>
    </AppShellHeader>
  );
}
