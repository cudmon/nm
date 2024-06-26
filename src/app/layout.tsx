import { theme } from "./theme";
import { ReactNode } from "react";
import { Jost } from "next/font/google";
import { Navbar } from "components/Navbar";
import { Notifications } from "@mantine/notifications";
import { GoogleAnalytics } from "@next/third-parties/google";
import {
  AppShell,
  AppShellMain,
  ColorSchemeScript,
  Container,
  MantineProvider,
  Stack,
} from "@mantine/core";

import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

type Props = {
  children: ReactNode;
};

const jost = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export default function Layout({ children }: Readonly<Props>) {
  return (
    <html className={jost.className} lang="en">
      <head>
        <ColorSchemeScript defaultColorScheme="auto" />
        <meta name="google-adsense-account" content="ca-pub-7182838395377099" />
      </head>
      <body>
        <MantineProvider defaultColorScheme="auto" theme={theme}>
          <Notifications />
          <AppShell padding="md" header={{ height: 60 }}>
            <Navbar />
            <AppShellMain>
              <Container size="md">
                <Stack gap={24}>{children}</Stack>
              </Container>
            </AppShellMain>
          </AppShell>
        </MantineProvider>
      </body>
      <GoogleAnalytics gaId="G-MX0ERSSJ55" />
    </html>
  );
}
