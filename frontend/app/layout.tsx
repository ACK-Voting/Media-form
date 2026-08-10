import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/contexts/ToastContext";
import ContentBootstrap from "@/components/ContentBootstrap";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

// The church website is now what lives at the root. The media-team app
// overrides this from app/media/layout.tsx, and the CMS from app/cms/layout.tsx.
export const metadata: Metadata = {
  title: "ACK Mombasa Memorial Cathedral",
  description:
    "ACK Mombasa Memorial Cathedral — the mother church of the Diocese of Mombasa, serving the coastal region of Kenya since 1903.",
  icons: {
    icon: "/logo_1.jpeg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased font-sans`}>
        <ToastProvider>
          {/* Loads all website content from the backend on first paint. */}
          <ContentBootstrap />
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
