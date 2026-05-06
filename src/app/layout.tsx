import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
export const metadata: Metadata = {
  title: "KhadraManager | إدارة مشغل خضرا",
  description: "نظام إدارة مشغل خضرا لتتبع الحصاد وحساب الأجور",
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#1a7a3c",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="apple-touch-icon" href="/icon.png" />
      </head>
      <body className={`min-h-screen bg-background font-sans`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
