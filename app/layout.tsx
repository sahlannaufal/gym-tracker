import type { Metadata, Viewport } from "next";
import "./globals.css";
import SyncEngine from "@/components/SyncEngine";
import { SerwistProvider } from "@/components/SerwistProvider";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import MixpanelAnalytics from "@/components/MixpanelAnalytics";
import packageJson from "@/package.json";
import AuthGate from "@/components/AuthGate";
import AppShell from "@/components/AppShell";

export const metadata: Metadata = {
  applicationName: "Gym Progress Tracker",
  title: "Gym Progress Tracker",
  description: "Catat latihan dan pantau progres bebanmu",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "GymProgress",
  },
  icons: {
    icon: [
      {
        url: "/icons/icon.svg",
        type: "image/svg+xml",
      },
    ],
    shortcut: "/icons/icon.svg",
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#030712",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const content = (
    <>
      <MixpanelAnalytics appVersion={packageJson.version} />
      <SyncEngine />
      <AuthGate>
        <AppShell>{children}</AppShell>
      </AuthGate>
    </>
  );

  return (
    <html lang="id">
      <body className="min-h-screen bg-gray-950 text-gray-100 antialiased">
        {process.env.NODE_ENV === "production" && <GoogleAnalytics />}
        {process.env.NODE_ENV === "production" ? (
          <SerwistProvider swUrl="/serwist/sw.js">{content}</SerwistProvider>
        ) : (
          content
        )}
      </body>
    </html>
  );
}
