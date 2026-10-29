import type { Metadata, Viewport } from "next";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import { AppLayoutShell } from "@/components/AppLayoutShell";
import { PwaRegistrar } from "@/components/PwaRegistrar";

export const metadata: Metadata = {
  title: "QueueLess AI - Lagos Service Guide & Queue Radar",
  description: "Prepare for in-person services with sourced requirements, official checklists, and transparent queue information across Lagos. Built for the Nebius x NVIDIA Hackathon.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "QueueLess AI",
  },
  icons: {
    icon: "/icon-192.png",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0f1d",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body>
        <PwaRegistrar />
        <AppLayoutShell>{children}</AppLayoutShell>
      </body>
    </html>
  );
}
