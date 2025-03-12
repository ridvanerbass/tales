import { TempoInit } from "@/components/tempo-init";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { ThemeProvider } from "./theme-provider";
import { UserProvider } from "@/components/UserProvider";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import { initLanguage } from "@/lib/i18n";

// Dil tercihini başlat
if (typeof window !== "undefined") {
  initLanguage();
}

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Masal Dünyası",
  description: "Çocuklar için interaktif masal okuma uygulaması",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <link
          rel="icon"
          href="https://images.unsplash.com/photo-1618945524163-32451704cbb8?w=32&h=32&q=80"
        />
        <Script src="https://api.tempolabs.ai/proxy-asset?url=https://storage.googleapis.com/tempo-public-assets/error-handling.js" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <UserProvider>
            {children}
            <Toaster />
            <TempoInit />
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
