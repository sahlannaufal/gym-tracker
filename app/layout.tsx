import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import InstallPrompt from "@/components/InstallPrompt";
import SyncEngine from "@/components/SyncEngine";
import { SerwistProvider } from "@/components/SerwistProvider";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import MixpanelAnalytics from "@/components/MixpanelAnalytics";
import packageJson from "@/package.json";

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
      <main className="mx-auto w-full max-w-2xl px-4 pt-6 pb-28">{children}</main>
      <InstallPrompt />
      <BottomNav />
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
